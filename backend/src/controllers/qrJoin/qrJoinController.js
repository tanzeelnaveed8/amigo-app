const userCredentialDB = require('../../models/userAuth/userCredential');
const groupDB = require('../../models/group/group');
const chanelDB = require('../../models/chanel/chanel');
const { ConversationModel } = require('../../models/userChat/ConversationModel');
const mongoose = require('mongoose');

const QR_PREFIX = 'amigo://';

function buildQrPayload(type, id, name, extra = {}) {
  return {
    type,
    id: String(id),
    name: name || '',
    ...extra,
    payload: `${QR_PREFIX}${type}/${id}`,
  };
}

exports.getQrPayload = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { type, id } = req.query;
    if (!type || !id) {
      return res.status(400).json({
        success: false,
        message: 'Query params type and id are required',
      });
    }
    const allowed = ['dm', 'group', 'channel'];
    if (!allowed.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be dm, group, or channel',
      });
    }
    if (type === 'dm') {
      const user = await userCredentialDB.findById(id).select('firstName lastName userName userProfile');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName || 'User';
      return res.status(200).json({
        success: true,
        data: buildQrPayload('dm', id, name, { userName: user.userName, userProfile: user.userProfile }),
      });
    }
    if (type === 'group') {
      const group = await groupDB.findById(id).populate('createdBy', 'firstName lastName userName');
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      const isParticipant = group.participants.some((p) => p.toString() === userId.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Not a member of this group' });
      }
      const name = group.title || 'Group';
      return res.status(200).json({
        success: true,
        data: buildQrPayload('group', id, name, {
          groupProfile: group.groupProfile,
          bio: group.bio,
        }),
      });
    }
    if (type === 'channel') {
      const channel = await chanelDB.findById(id).populate('createdBy', 'firstName lastName userName');
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
      }
      const isParticipant = channel.participants.some((p) => p.toString() === userId.toString());
      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Not a member of this channel' });
      }
      const name = channel.title || 'Channel';
      return res.status(200).json({
        success: true,
        data: buildQrPayload('channel', id, name, {
          chanelProfile: channel.chanelProfile,
          bio: channel.bio,
        }),
      });
    }
    return res.status(400).json({ success: false, message: 'Invalid type' });
  } catch (error) {
    console.error('getQrPayload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get QR payload',
    });
  }
};

exports.joinByQr = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { type, id, payload } = req.body;
    let resolvedType = type;
    let resolvedId = id;
    if (payload && typeof payload === 'string' && payload.startsWith(QR_PREFIX)) {
      const parts = payload.replace(QR_PREFIX, '').split('/');
      if (parts.length >= 2) {
        resolvedType = parts[0];
        resolvedId = parts[1];
      }
    }
    if (!resolvedType || !resolvedId) {
      return res.status(400).json({
        success: false,
        message: 'type and id (or payload) are required',
      });
    }
    const allowed = ['dm', 'group', 'channel'];
    if (!allowed.includes(resolvedType)) {
      return res.status(400).json({
        success: false,
        message: 'type must be dm, group, or channel',
      });
    }

    if (resolvedType === 'dm') {
      const otherUserId = resolvedId;
      if (otherUserId === userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot start DM with yourself',
        });
      }
      const otherUser = await userCredentialDB.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      let conv = await ConversationModel.findOne({
        conversationType: 'dm',
        $and: [
          { participents: { $size: 2 } },
          { participents: new mongoose.Types.ObjectId(userId) },
          { participents: new mongoose.Types.ObjectId(otherUserId) },
        ],
      });
      if (!conv) {
        conv = await ConversationModel.create({
          sender: userId,
          receiver: otherUserId,
          participents: [userId, otherUserId],
          conversationType: 'dm',
          messages: [],
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          conversationId: conv._id.toString(),
          type: 'dm',
          itemData: {
            _id: otherUser._id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            userName: otherUser.userName,
            userProfile: otherUser.userProfile,
          },
        },
      });
    }

    if (resolvedType === 'group') {
      const group = await groupDB.findById(resolvedId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      const alreadyMember = group.participants.some((p) => p.toString() === userId.toString());
      if (alreadyMember) {
        const conv = await ConversationModel.findOne({ groupId: group._id, conversationType: 'group' });
        return res.status(200).json({
          success: true,
          data: {
            type: 'group',
            itemData: {
              _id: group._id,
              title: group.title,
              groupProfile: group.groupProfile,
              participants: group.participants,
              groupAdmin: group.groupAdmin,
            },
            conversationId: conv ? conv._id.toString() : null,
          },
        });
      }
      group.participants.push(userId);
      await group.save();
      let conv = await ConversationModel.findOne({ groupId: group._id, conversationType: 'group' });
      if (conv) {
        if (!conv.participents.some((p) => p.toString() === userId.toString())) {
          conv.participents.push(userId);
          await conv.save();
        }
      } else {
        conv = await ConversationModel.create({
          participents: group.participants,
          groupId: group._id,
          conversationType: 'group',
          messages: [],
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          type: 'group',
          itemData: {
            _id: group._id,
            title: group.title,
            groupProfile: group.groupProfile,
            participants: group.participants,
            groupAdmin: group.groupAdmin,
          },
          conversationId: conv._id.toString(),
        },
      });
    }

    if (resolvedType === 'channel') {
      const channel = await chanelDB.findById(resolvedId);
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Channel not found' });
      }
      const alreadyMember = channel.participants.some((p) => p.toString() === userId.toString());
      if (alreadyMember) {
        const conv = await ConversationModel.findOne({ chanelId: channel._id, conversationType: 'chanel' });
        return res.status(200).json({
          success: true,
          data: {
            type: 'channel',
            itemData: {
              _id: channel._id,
              title: channel.title,
              chanelProfile: channel.chanelProfile,
              participants: channel.participants,
              chanelAdmin: channel.chanelAdmin,
            },
            conversationId: conv ? conv._id.toString() : null,
          },
        });
      }
      channel.participants.push(userId);
      await channel.save();
      let conv = await ConversationModel.findOne({ chanelId: channel._id, conversationType: 'chanel' });
      if (conv) {
        if (!conv.participents.some((p) => p.toString() === userId.toString())) {
          conv.participents.push(userId);
          await conv.save();
        }
      } else {
        conv = await ConversationModel.create({
          participents: channel.participants,
          chanelId: channel._id,
          conversationType: 'chanel',
          messages: [],
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          type: 'channel',
          itemData: {
            _id: channel._id,
            title: channel.title,
            chanelProfile: channel.chanelProfile,
            participants: channel.participants,
            chanelAdmin: channel.chanelAdmin,
          },
          conversationId: conv._id.toString(),
        },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid type' });
  } catch (error) {
    console.error('joinByQr error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to join',
    });
  }
};
