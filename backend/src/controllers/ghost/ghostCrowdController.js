const GhostCrowd = require('../../models/ghost/ghostCrowd');
const GhostMember = require('../../models/ghost/ghostMember');
const GhostMessage = require('../../models/ghost/ghostMessage');
const GhostReport = require('../../models/ghost/ghostReport');
const GhostBlockedUser = require('../../models/ghost/ghostBlockedUser');
const { checkCrowdExpiry } = require('../../utility/ghost/expiryChecker');
const { default: mongoose } = require('mongoose');
const { s3UploadMiddleware } = require('../../middleware/mediaUpload');

/**
 * 1. Create Crowd
 * POST /api/ghost-crowd/create-crowd
 * Body: { crowdName, duration, deviceId, ghostName, avatarBgColor }
 */
const createCrowd = async (req, res) => {
  try {
    const { crowdName, duration, deviceId, ghostName, avatarBgColor } = req.body;

    // Validation
    if (!crowdName || !duration || !deviceId || !ghostName || !avatarBgColor) {
      return res.status(400).json({
        message: 'Missing required fields: crowdName, duration, deviceId, ghostName, avatarBgColor',
        status: 400
      });
    }

    if (![1, 3, 7, 15, 31].includes(duration)) {
      return res.status(400).json({
        message: 'Duration must be one of: 1, 3, 7, 15, 31 days',
        status: 400
      });
    }

    // Check daily crowd creation limit (3 per day)
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    
    const dailyCount = await GhostCrowd.countDocuments({
      creatorDeviceId: deviceId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (dailyCount >= 3) {
      return res.status(403).json({
        message: 'Daily crowd creation limit reached. You can create up to 3 crowds per day.',
        status: 403
      });
    }

    // Check if crowd name already exists
    const existingCrowd = await GhostCrowd.findOne({ crowdName: crowdName.toLowerCase() });
    if (existingCrowd) {
      return res.status(409).json({
        message: 'Crowd name already exists',
        status: 409
      });
    }

    // Create crowd
    const crowd = await GhostCrowd.create({
      crowdName: crowdName.toLowerCase(),
      creatorDeviceId: deviceId,
      duration,
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    });

    // Add creator as admin member
    await GhostMember.create({
      crowdId: crowd._id,
      deviceId,
      ghostName,
      avatarBgColor,
      isAdmin: true,
      isCreator: true
    });

    // Generate QR code data
    const qrCodeData = `amigo://crowd/join/${crowdName}`;

    res.status(201).json({
      message: 'Crowd created successfully',
      status: 201,
      data: {
        crowdId: crowd._id,
        crowdName: crowd.crowdName,
        qrCodeData,
        expiresAt: crowd.expiresAt,
        duration: crowd.duration
      }
    });
  } catch (error) {
    console.error('Error creating crowd:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 2. Join Crowd
 * POST /api/ghost-crowd/join-crowd
 * Body: { crowdName, deviceId, ghostName, avatarBgColor }
 */
const joinCrowd = async (req, res) => {
  try {
    const { crowdName, deviceId, ghostName, avatarBgColor } = req.body;

    if (!crowdName || !deviceId || !ghostName || !avatarBgColor) {
      return res.status(400).json({
        message: 'Missing required fields: crowdName, deviceId, ghostName, avatarBgColor',
        status: 400
      });
    }

    // Find crowd by name
    const crowd = await GhostCrowd.findOne({ crowdName: crowdName.toLowerCase() });
    if (!crowd) {
      return res.status(404).json({
        message: 'Crowd not found',
        status: 404
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowd._id);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Block rejoins: if this device was blocked (e.g. by admin), reject join
    const blockedIds = crowd.blockedDeviceIds || [];
    if (blockedIds.some(id => String(id) === String(deviceId))) {
      return res.status(403).json({
        message: 'You are banned from this crowd',
        status: 403
      });
    }

    // Check if member already exists (including those who left)
    const existingMember = await GhostMember.findOne({
      crowdId: crowd._id,
      deviceId
    });

    let member;

    if (existingMember) {
      // If member exists and hasn't left, return existing member data
      if (!existingMember.leftAt) {
        const members = await GhostMember.find({ crowdId: crowd._id, leftAt: null });
        return res.status(200).json({
          message: 'Already a member of this crowd',
          status: 200,
          data: {
            crowdId: crowd._id,
            crowdName: crowd.crowdName,
            members: members.map(m => ({
              memberId: m._id,
              deviceId: m.deviceId,
              ghostName: m.ghostName,
              avatarBgColor: m.avatarBgColor,
              isAdmin: m.isAdmin,
              isCreator: m.isCreator
            })),
            isCreator: existingMember.isCreator,
            duration: crowd.duration,
            expiresAt: crowd.expiresAt
          }
        });
      }
      
      // Member previously left, check for duplicate ghost name (excluding the rejoining member)
      const duplicateName = await GhostMember.findOne({
        crowdId: crowd._id,
        ghostName,
        leftAt: null,
        deviceId: { $ne: deviceId } // Exclude the rejoining member
      });

      if (duplicateName) {
        return res.status(409).json({
          message: 'Ghost name already taken in this crowd',
          status: 409
        });
      }

      // Rejoin: Update existing member record
      // Preserve creator status, but reset admin status (unless they were creator)
      existingMember.ghostName = ghostName;
      existingMember.avatarBgColor = avatarBgColor;
      existingMember.leftAt = null; // Clear leftAt to rejoin
      existingMember.joinedAt = new Date(); // Update join time
      // Reset admin status unless they were the creator (creators should remain admin)
      if (!existingMember.isCreator) {
        existingMember.isAdmin = false;
      }
      await existingMember.save();
      
      member = existingMember;
    } else {
      // New member - check for duplicate ghost name
      const duplicateName = await GhostMember.findOne({
        crowdId: crowd._id,
        ghostName,
        leftAt: null
      });

      if (duplicateName) {
        return res.status(409).json({
          message: 'Ghost name already taken in this crowd',
          status: 409
        });
      }

      // Create new member
      member = await GhostMember.create({
        crowdId: crowd._id,
        deviceId,
        ghostName,
        avatarBgColor,
        isAdmin: false,
        isCreator: false
      });
    }

    // Get all members
    const members = await GhostMember.find({ crowdId: crowd._id, leftAt: null });

    // Create system message for member joined
    const systemMessageText = `${member.ghostName} joined the crowd.`;
    await GhostMessage.create({
      crowdId: crowd._id,
      senderDeviceId: 'system',
      senderGhostName: 'System',
      text: systemMessageText,
      media: null
    });

    // Emit socket event for member joined
    if (global.ghostIO) {
      global.ghostIO.to(crowd._id.toString()).emit('memberJoined', {
        crowdId: crowd._id.toString(),
        member: {
          memberId: member._id,
          deviceId: member.deviceId, // Include deviceId for identification
          ghostName: member.ghostName,
          avatarBgColor: member.avatarBgColor,
          isAdmin: member.isAdmin,
          isCreator: member.isCreator
        }
      });
    }

    res.status(201).json({
      message: 'Joined crowd successfully',
      status: 201,
      data: {
        crowdId: crowd._id,
        crowdName: crowd.crowdName,
        members: members.map(m => ({
          memberId: m._id,
          deviceId: m.deviceId,
          ghostName: m.ghostName,
          avatarBgColor: m.avatarBgColor,
          isAdmin: m.isAdmin,
          isCreator: m.isCreator
        })),
        isCreator: member.isCreator,
        duration: crowd.duration,
        expiresAt: crowd.expiresAt
      }
    });
  } catch (error) {
    console.error('Error joining crowd:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 3. Get Crowd Info
 * GET /api/ghost-crowd/get-crowd-info?crowdId={id}&deviceId={id}
 */
const getCrowdInfo = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.query;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    const crowd = expiryCheck.crowd;

    // Get members
    const members = await GhostMember.find({ crowdId, leftAt: null });

    // Check if current user is creator
    const currentMember = members.find(m => m.deviceId === deviceId);
    const isCreator = currentMember ? currentMember.isCreator : false;

    // Get pinned message if exists
    let pinnedMessage = null;
    if (crowd.pinnedMessageId) {
      const pinnedMsg = await GhostMessage.findById(crowd.pinnedMessageId);
      if (pinnedMsg) {
        pinnedMessage = {
          messageId: pinnedMsg._id,
          senderDeviceId: pinnedMsg.senderDeviceId,
          senderGhostName: pinnedMsg.senderGhostName,
          text: pinnedMsg.text,
          media: pinnedMsg.media || null,
          createdAt: pinnedMsg.createdAt
        };
      }
    }

    res.status(200).json({
      message: 'Crowd info retrieved successfully',
      status: 200,
      data: {
        crowdId: crowd._id,
        crowdName: crowd.crowdName,
        members: members.map(m => ({
          memberId: m._id,
          deviceId: m.deviceId, // Include deviceId for identification
          ghostName: m.ghostName,
          avatarBgColor: m.avatarBgColor,
          isAdmin: m.isAdmin,
          isCreator: m.isCreator,
          mutedUntil: m.mutedUntil ? m.mutedUntil.toISOString() : null
        })),
        isCreator,
        duration: crowd.duration,
        expiresAt: crowd.expiresAt,
        memberCount: members.length,
        isChatLocked: crowd.isChatLocked || false,
        pinnedMessage: pinnedMessage,
        currentUserMutedUntil: currentMember?.mutedUntil ? currentMember.mutedUntil.toISOString() : null
      }
    });
  } catch (error) {
    console.error('Error getting crowd info:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 4. Get Active Crowds
 * GET /api/ghost-crowd/get-active-crowds?deviceId={id}
 */
const getActiveCrowds = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        message: 'Missing required field: deviceId',
        status: 400
      });
    }

    // Find all crowds where user is a member
    const members = await GhostMember.find({ deviceId, leftAt: null });
    const crowdIds = members.map(m => m.crowdId);

    // Get active crowds
    const crowds = await GhostCrowd.find({
      _id: { $in: crowdIds },
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    // Get member counts for each crowd
    const crowdsWithCounts = await Promise.all(
      crowds.map(async (crowd) => {
        const memberCount = await GhostMember.countDocuments({
          crowdId: crowd._id,
          leftAt: null
        });

        const now = new Date();
        const expiresIn = Math.ceil((crowd.expiresAt - now) / (1000 * 60 * 60 * 24));

        return {
          crowdId: crowd._id,
          crowdName: crowd.crowdName,
          memberCount,
          duration: crowd.duration,
          expiresIn: expiresIn > 0 ? expiresIn : 0
        };
      })
    );

    res.status(200).json({
      message: 'Active crowds retrieved successfully',
      status: 200,
      data: crowdsWithCounts
    });
  } catch (error) {
    console.error('Error getting active crowds:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 5. Get Crowd Members
 * GET /api/ghost-crowd/get-crowd-members?crowdId={id}
 */
const getCrowdMembers = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.query;

    if (!crowdId) {
      return res.status(400).json({
        message: 'Missing required field: crowdId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Get all members
    let members = await GhostMember.find({ crowdId, leftAt: null }).sort({ joinedAt: 1 });

    // Sort: current user first, then admins, then others
    if (deviceId) {
      const currentUser = members.find(m => m.deviceId === deviceId);
      const admins = members.filter(m => m.isAdmin && m.deviceId !== deviceId);
      const others = members.filter(m => !m.isAdmin && m.deviceId !== deviceId);

      members = currentUser ? [currentUser, ...admins, ...others] : [...admins, ...others];
    } else {
      // Sort by admin status if no deviceId provided
      members.sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return 0;
      });
    }

    res.status(200).json({
      message: 'Crowd members retrieved successfully',
      status: 200,
      data: members.map(m => ({
        memberId: m._id,
        deviceId: m.deviceId, // Include deviceId for identification
        ghostName: m.ghostName,
        avatarBgColor: m.avatarBgColor,
        isAdmin: m.isAdmin,
        isCreator: m.isCreator,
        joinedAt: m.joinedAt,
        mutedUntil: m.mutedUntil ? m.mutedUntil.toISOString() : null
      }))
    });
  } catch (error) {
    console.error('Error getting crowd members:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 6. Get Crowd Messages
 * GET /api/ghost-crowd/get-crowd-messages?crowdId={id}&limit={number}&offset={number}&deviceId={id}
 */
const getCrowdMessages = async (req, res) => {
  try {
    const { crowdId, limit = 50, offset = 0, deviceId } = req.query;

    if (!crowdId) {
      return res.status(400).json({
        message: 'Missing required field: crowdId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Get blocked device IDs for the requesting user (if deviceId is provided)
    let blockedDeviceIds = [];
    if (deviceId) {
      const blockedUsers = await GhostBlockedUser.find({
        crowdId,
        blockerDeviceId: deviceId
      });
      blockedDeviceIds = blockedUsers.map(bu => bu.blockedDeviceId);
    }

    // Get paginated messages
    const messages = await GhostMessage.find({ crowdId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Filter out messages from blocked users
    const filteredMessages = messages.filter(m => 
      !blockedDeviceIds.includes(m.senderDeviceId)
    );

    res.status(200).json({
      message: 'Messages retrieved successfully',
      status: 200,
      data: filteredMessages.map(m => ({
        messageId: m._id,
        senderDeviceId: m.senderDeviceId, // Include senderDeviceId for identification
        senderGhostName: m.senderGhostName,
        text: m.text,
        media: m.media,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting crowd messages:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 7. Send Message
 * POST /api/ghost-crowd/send-message
 * Body: { crowdId, deviceId, ghostName, text, media? }
 */
const sendMessage = async (req, res) => {
  try {
    const { crowdId, deviceId, ghostName, text, media } = req.body;

    if (!crowdId || !deviceId || !ghostName || !text) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId, ghostName, text',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify member exists
    const member = await GhostMember.findOne({
      crowdId,
      deviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(403).json({
        message: 'You are not a member of this crowd',
        status: 403
      });
    }

    // Check if chat is locked
    const crowd = await GhostCrowd.findById(crowdId);
    if (!crowd) {
      return res.status(404).json({
        message: 'Crowd not found',
        status: 404
      });
    }

    // If chat is locked, only admins can send messages
    if (crowd.isChatLocked && !member.isAdmin) {
      return res.status(403).json({
        message: 'Chat locked. Only admins can send messages.',
        status: 403
      });
    }

    // If member is muted, reject send
    if (member.mutedUntil && new Date() < new Date(member.mutedUntil)) {
      return res.status(403).json({
        message: "You are muted. You can't send messages until unmuted.",
        status: 403
      });
    }

    // Create message
    const message = await GhostMessage.create({
      crowdId,
      senderDeviceId: deviceId,
      senderGhostName: ghostName,
      text,
      media: media || null
    });

    // Emit via socket
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('ghostMessage', {
        messageId: message._id,
        crowdId: crowdId.toString(),
        senderDeviceId: deviceId, // Include senderDeviceId for identification
        senderGhostName: ghostName,
        text,
        media: message.media || null,
        createdAt: message.createdAt
      });
    }
    res.status(201).json({
      message: 'Message sent successfully',
      status: 201,
      data: {
        messageId: message._id,
        success: true
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 8. Delete Crowd
 * DELETE /api/ghost-crowd/delete-crowd
 * Body: { crowdId, deviceId }
 */
const deleteCrowd = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.body;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Get crowd
    const crowd = await GhostCrowd.findById(crowdId);
    if (!crowd) {
      return res.status(404).json({
        message: 'Crowd not found',
        status: 404
      });
    }

    // Verify creator
    if (crowd.creatorDeviceId !== deviceId) {
      return res.status(403).json({
        message: 'Only the creator can delete the crowd',
        status: 403
      });
    }

    // Delete all related data
    await Promise.all([
      GhostMember.deleteMany({ crowdId }),
      GhostMessage.deleteMany({ crowdId }),
      GhostCrowd.findByIdAndDelete(crowdId)
    ]);

    // Emit socket event for crowd deleted
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('crowdDeleted', {
        crowdId: crowdId.toString()
      });
    }

    res.status(200).json({
      message: 'Crowd deleted successfully',
      status: 200,
      data: { success: true }
    });
  } catch (error) {
    console.error('Error deleting crowd:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 9. Leave Crowd
 * POST /api/ghost-crowd/leave-crowd
 * Body: { crowdId, deviceId }
 */
const leaveCrowd = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.body;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Get member
    const member = await GhostMember.findOne({
      crowdId,
      deviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
        status: 404
      });
    }

    // Check if only admin
    if (member.isAdmin) {
      const adminCount = await GhostMember.countDocuments({
        crowdId,
        isAdmin: true,
        leftAt: null
      });

      if (adminCount === 1) {
        return res.status(400).json({
          message: 'Cannot leave crowd as you are the only admin',
          status: 400
        });
      }
    }

    // Mark as left
    member.leftAt = new Date();
    await member.save();

    // Create system message for member left
    const systemMessageText = `${member.ghostName} left the crowd.`;
    await GhostMessage.create({
      crowdId,
      senderDeviceId: 'system',
      senderGhostName: 'System',
      text: systemMessageText,
      media: null
    });

    // Emit socket event for member left
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('memberLeft', {
        crowdId: crowdId.toString(),
        deviceId,
        ghostName: member.ghostName
      });
    }

    res.status(200).json({
      message: 'Left crowd successfully',
      status: 200,
      data: { success: true }
    });
  } catch (error) {
    console.error('Error leaving crowd:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 10. Remove Member
 * POST /api/ghost-crowd/remove-member
 * Body: { crowdId, memberDeviceId, adminDeviceId }
 */
const removeMember = async (req, res) => {
  try {
    const { crowdId, memberDeviceId, adminDeviceId } = req.body;

    if (!crowdId || !memberDeviceId || !adminDeviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, memberDeviceId, adminDeviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify admin
    const admin = await GhostMember.findOne({
      crowdId,
      deviceId: adminDeviceId,
      isAdmin: true,
      leftAt: null
    });

    if (!admin) {
      return res.status(403).json({
        message: 'Only admins can remove members',
        status: 403
      });
    }

    // Get member to remove
    const member = await GhostMember.findOne({
      crowdId,
      deviceId: memberDeviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
        status: 404
      });
    }

    // Prevent removing creator
    if (member.isCreator) {
      return res.status(400).json({
        message: 'Cannot remove the crowd creator',
        status: 400
      });
    }

    // Mark as left
    member.leftAt = new Date();
    await member.save();

    // Add to crowd block list so they cannot rejoin via QR code
    await GhostCrowd.findByIdAndUpdate(crowdId, {
      $addToSet: { blockedDeviceIds: memberDeviceId }
    });

    // Create system message for member removed
    const systemMessageText = `${member.ghostName} was removed from the crowd by an admin.`;
    await GhostMessage.create({
      crowdId,
      senderDeviceId: 'system',
      senderGhostName: 'System',
      text: systemMessageText,
      media: null
    });

    // Emit socket event for member removed
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('memberRemoved', {
        crowdId: crowdId.toString(),
        deviceId: memberDeviceId,
        ghostName: member.ghostName
      });
    }

    res.status(200).json({
      message: 'Member removed successfully',
      status: 200,
      data: { success: true }
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 11. Promote/Demote Admin
 * POST /api/ghost-crowd/update-admin-status
 * Body: { crowdId, memberDeviceId, adminDeviceId, isAdmin }
 */
const updateAdminStatus = async (req, res) => {
  try {
    const { crowdId, memberDeviceId, adminDeviceId, isAdmin } = req.body;

    if (!crowdId || !memberDeviceId || !adminDeviceId || typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, memberDeviceId, adminDeviceId, isAdmin',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify admin
    const admin = await GhostMember.findOne({
      crowdId,
      deviceId: adminDeviceId,
      isAdmin: true,
      leftAt: null
    });

    if (!admin) {
      return res.status(403).json({
        message: 'Only admins can update admin status',
        status: 403
      });
    }

    // Get member to update
    const member = await GhostMember.findOne({
      crowdId,
      deviceId: memberDeviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
        status: 404
      });
    }

    // Prevent demoting last admin
    if (!isAdmin && member.isAdmin) {
      const adminCount = await GhostMember.countDocuments({
        crowdId,
        isAdmin: true,
        leftAt: null
      });

      if (adminCount === 1) {
        return res.status(400).json({
          message: 'Cannot demote the last admin',
          status: 400
        });
      }
    }

    // Update admin status
    member.isAdmin = isAdmin;
    await member.save();

    // Emit socket event for admin updated
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('adminUpdated', {
        crowdId: crowdId.toString(),
        deviceId: memberDeviceId,
        isAdmin
      });
    }

    res.status(200).json({
      message: 'Admin status updated successfully',
      status: 200,
      data: { success: true }
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 12. Toggle Chat Lock
 * POST /api/ghost-crowd/toggle-chat-lock
 * Body: { crowdId, deviceId }
 */
const toggleChatLock = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.body;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    const crowd = expiryCheck.crowd;

    // Verify user is admin
    const member = await GhostMember.findOne({
      crowdId,
      deviceId,
      isAdmin: true,
      leftAt: null
    });

    if (!member) {
      return res.status(403).json({
        message: 'Only admins can lock/unlock chat',
        status: 403
      });
    }

    // Toggle chat lock status
    crowd.isChatLocked = !crowd.isChatLocked;
    await crowd.save();

    // Create system message for lock/unlock
    const systemMessageText = crowd.isChatLocked
      ? 'Chat locked. Only admins can send messages.'
      : 'Chat unlocked. All members can send messages.';
    
    await GhostMessage.create({
      crowdId,
      senderDeviceId: 'system',
      senderGhostName: 'System',
      text: systemMessageText,
      media: null
    });

    // Emit socket event for chat lock updated
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('chatLockUpdated', {
        crowdId: crowdId.toString(),
        isChatLocked: crowd.isChatLocked
      });
    }

    res.status(200).json({
      message: `Chat ${crowd.isChatLocked ? 'locked' : 'unlocked'} successfully`,
      status: 200,
      data: {
        success: true,
        isChatLocked: crowd.isChatLocked
      }
    });
  } catch (error) {
    console.error('Error toggling chat lock:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 13. Upload Media (Ghost Mode)
 * POST /api/ghost-crowd/upload-media
 * Body: FormData with 'images' file and 'deviceId'
 * No JWT required - uses deviceId for validation
 */
const uploadMedia = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const uploadedFilesPaths = req?.uploadedFiles?.map(file => file.location);

    if (!deviceId) {
      return res.status(400).json({
        message: 'Missing required field: deviceId',
        status: 400
      });
    }

    if (!uploadedFilesPaths || uploadedFilesPaths.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded',
        status: 400
      });
    }

    // Return the media URL (first file)
    res.status(201).json({
      status: 201,
      message: 'Media uploaded successfully',
      data: {
        mediaurl: uploadedFilesPaths[0]
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 14. Get Daily Crowd Creation Count
 * GET /api/ghost-crowd/get-daily-crowd-count?deviceId={id}
 */
const getDailyCrowdCount = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        message: 'Missing required field: deviceId',
        status: 400
      });
    }

    // Get start and end of today in UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Count crowds created today by this deviceId
    const count = await GhostCrowd.countDocuments({
      creatorDeviceId: deviceId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    res.status(200).json({
      message: 'Daily crowd count retrieved successfully',
      status: 200,
      data: {
        count,
        limit: 3,
        canCreate: count < 3
      }
    });
  } catch (error) {
    console.error('Error getting daily crowd count:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * Pin/Unpin Message
 * POST /api/ghost-crowd/pin-message
 * Body: { crowdId, messageId, deviceId }
 */
const pinMessage = async (req, res) => {
  try {
    const { crowdId, messageId, deviceId } = req.body;

    if (!crowdId || !messageId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, messageId, deviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify user is admin
    const member = await GhostMember.findOne({
      crowdId,
      deviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(403).json({
        message: 'You are not a member of this crowd',
        status: 403
      });
    }

    if (!member.isAdmin) {
      return res.status(403).json({
        message: 'Only admins can pin messages',
        status: 403
      });
    }

    // Verify message exists and belongs to this crowd
    const message = await GhostMessage.findOne({
      _id: messageId,
      crowdId
    });

    if (!message) {
      return res.status(404).json({
        message: 'Message not found',
        status: 404
      });
    }

    // Update crowd with pinned message
    const crowd = await GhostCrowd.findByIdAndUpdate(
      crowdId,
      { pinnedMessageId: messageId },
      { new: true }
    );

    // Emit socket event to all members in the crowd
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('messagePinned', {
        crowdId: crowdId.toString(),
        pinnedMessage: {
          messageId: message._id,
          senderDeviceId: message.senderDeviceId,
          senderGhostName: message.senderGhostName,
          text: message.text,
          media: message.media || null,
          createdAt: message.createdAt
        }
      });
    }

    res.status(200).json({
      message: 'Message pinned successfully',
      status: 200,
      data: {
        pinnedMessageId: messageId
      }
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * Unpin Message
 * POST /api/ghost-crowd/unpin-message
 * Body: { crowdId, deviceId }
 */
const unpinMessage = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.body;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify user is admin
    const member = await GhostMember.findOne({
      crowdId,
      deviceId,
      leftAt: null
    });

    if (!member) {
      return res.status(403).json({
        message: 'You are not a member of this crowd',
        status: 403
      });
    }

    if (!member.isAdmin) {
      return res.status(403).json({
        message: 'Only admins can unpin messages',
        status: 403
      });
    }

    // Update crowd to remove pinned message
    await GhostCrowd.findByIdAndUpdate(
      crowdId,
      { pinnedMessageId: null },
      { new: true }
    );

    // Emit socket event to all members in the crowd
    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('messageUnpinned', {
        crowdId: crowdId.toString()
      });
    }

    res.status(200).json({
      message: 'Message unpinned successfully',
      status: 200
    });
  } catch (error) {
    console.error('Error unpinning message:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 17. Mute Member
 * POST /api/ghost-crowd/mute-member
 * Body: { crowdId, memberDeviceId, adminDeviceId, duration: '1h' | '24h' | 'permanent' }
 */
const muteMember = async (req, res) => {
  try {
    const { crowdId, memberDeviceId, adminDeviceId, duration } = req.body;

    if (!crowdId || !memberDeviceId || !adminDeviceId || !duration) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, memberDeviceId, adminDeviceId, duration',
        status: 400
      });
    }

    if (!['1h', '24h', 'permanent'].includes(duration)) {
      return res.status(400).json({
        message: "duration must be one of: '1h', '24h', 'permanent'",
        status: 400
      });
    }

    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    const admin = await GhostMember.findOne({
      crowdId,
      deviceId: adminDeviceId,
      isAdmin: true,
      leftAt: null
    });
    if (!admin) {
      return res.status(403).json({
        message: 'Only admins can mute members',
        status: 403
      });
    }

    const member = await GhostMember.findOne({
      crowdId,
      deviceId: memberDeviceId,
      leftAt: null
    });
    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
        status: 404
      });
    }
    if (member.isCreator) {
      return res.status(400).json({
        message: 'Cannot mute the crowd creator',
        status: 400
      });
    }

    const now = new Date();
    let mutedUntil;
    if (duration === '1h') {
      mutedUntil = new Date(now.getTime() + 60 * 60 * 1000);
    } else if (duration === '24h') {
      mutedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else {
      mutedUntil = new Date('2099-01-01T00:00:00.000Z');
    }
    member.mutedUntil = mutedUntil;
    await member.save();

    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('muteUpdated', {
        crowdId: crowdId.toString(),
        memberDeviceId,
        mutedUntil: mutedUntil.toISOString()
      });
    }

    res.status(200).json({
      message: 'Member muted successfully',
      status: 200,
      data: { mutedUntil: mutedUntil.toISOString() }
    });
  } catch (error) {
    console.error('Error muting member:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 18. Unmute Member
 * POST /api/ghost-crowd/unmute-member
 * Body: { crowdId, memberDeviceId, adminDeviceId }
 */
const unmuteMember = async (req, res) => {
  try {
    const { crowdId, memberDeviceId, adminDeviceId } = req.body;

    if (!crowdId || !memberDeviceId || !adminDeviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, memberDeviceId, adminDeviceId',
        status: 400
      });
    }

    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    const admin = await GhostMember.findOne({
      crowdId,
      deviceId: adminDeviceId,
      isAdmin: true,
      leftAt: null
    });
    if (!admin) {
      return res.status(403).json({
        message: 'Only admins can unmute members',
        status: 403
      });
    }

    const member = await GhostMember.findOne({
      crowdId,
      deviceId: memberDeviceId,
      leftAt: null
    });
    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
        status: 404
      });
    }

    member.mutedUntil = null;
    await member.save();

    if (global.ghostIO) {
      global.ghostIO.to(crowdId.toString()).emit('muteUpdated', {
        crowdId: crowdId.toString(),
        memberDeviceId,
        mutedUntil: null
      });
    }

    res.status(200).json({
      message: 'Member unmuted successfully',
      status: 200
    });
  } catch (error) {
    console.error('Error unmuting member:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 19. Report Crowd
 * POST /api/ghost-crowd/report-crowd
 * Body: { crowdId, deviceId, reasonKey, details? }
 */
const reportCrowd = async (req, res) => {
  try {
    const { crowdId, deviceId, reasonKey, details } = req.body;

    if (!crowdId || !reasonKey) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, reasonKey',
        status: 400
      });
    }

    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    await GhostReport.create({
      crowdId,
      reportType: 'crowd',
      reporterDeviceId: deviceId || null,
      reasonKey: String(reasonKey).trim(),
      details: details ? String(details).trim().slice(0, 500) : null,
      messageId: null,
      reportedUserDeviceId: null,
      reportedUserGhostName: null
    });

    res.status(201).json({
      message: 'Report submitted successfully. Thank you for your feedback.',
      status: 201
    });
  } catch (error) {
    console.error('Error reporting crowd:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 20. Report Message
 * POST /api/ghost-crowd/report-message
 * Body: { crowdId, deviceId, messageId, reasonKey, details?, reportedUserDeviceId?, reportedUserGhostName? }
 */
const reportMessage = async (req, res) => {
  try {
    const { crowdId, deviceId, messageId, reasonKey, details, reportedUserDeviceId, reportedUserGhostName } = req.body;

    if (!crowdId || !messageId || !reasonKey) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, messageId, reasonKey',
        status: 400
      });
    }

    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    await GhostReport.create({
      crowdId,
      reportType: 'message',
      reporterDeviceId: deviceId || null,
      reasonKey: String(reasonKey).trim(),
      details: details ? String(details).trim().slice(0, 500) : null,
      messageId,
      reportedUserDeviceId: reportedUserDeviceId || null,
      reportedUserGhostName: reportedUserGhostName || null
    });

    res.status(201).json({
      message: 'Report submitted successfully. Thank you for your feedback.',
      status: 201
    });
  } catch (error) {
    console.error('Error reporting message:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 21. Block User
 * POST /api/ghost-crowd/block-user
 * Body: { crowdId, blockerDeviceId, blockedDeviceId }
 */
const blockUser = async (req, res) => {
  try {
    const { crowdId, blockerDeviceId, blockedDeviceId } = req.body;

    if (!crowdId || !blockerDeviceId || !blockedDeviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, blockerDeviceId, blockedDeviceId',
        status: 400
      });
    }

    // Prevent self-blocking
    if (blockerDeviceId === blockedDeviceId) {
      return res.status(400).json({
        message: 'You cannot block yourself',
        status: 400
      });
    }

    // Check expiry
    const expiryCheck = await checkCrowdExpiry(crowdId);
    if (!expiryCheck.isValid) {
      return res.status(400).json({
        message: expiryCheck.error,
        status: 400
      });
    }

    // Verify both users are members of the crowd
    const [blockerMember, blockedMember] = await Promise.all([
      GhostMember.findOne({ crowdId, deviceId: blockerDeviceId, leftAt: null }),
      GhostMember.findOne({ crowdId, deviceId: blockedDeviceId, leftAt: null })
    ]);

    if (!blockerMember) {
      return res.status(403).json({
        message: 'You are not a member of this crowd',
        status: 403
      });
    }

    if (!blockedMember) {
      return res.status(404).json({
        message: 'User to block is not found in this crowd',
        status: 404
      });
    }

    // Check if already blocked (use findOne to avoid duplicate key error)
    const existingBlock = await GhostBlockedUser.findOne({
      crowdId,
      blockerDeviceId,
      blockedDeviceId
    });

    if (existingBlock) {
      // Already blocked, return success (idempotent operation)
      return res.status(200).json({
        message: 'User is already blocked',
        status: 200,
        data: {
          blockedUserGhostName: blockedMember.ghostName
        }
      });
    }

    // Create block record
    await GhostBlockedUser.create({
      crowdId,
      blockerDeviceId,
      blockedDeviceId
    });

    res.status(201).json({
      message: 'User blocked successfully',
      status: 201,
      data: {
        blockedUserGhostName: blockedMember.ghostName
      }
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

/**
 * 22. Get Blocked Users
 * GET /api/ghost-crowd/get-blocked-users?crowdId={id}&deviceId={id}
 */
const getBlockedUsers = async (req, res) => {
  try {
    const { crowdId, deviceId } = req.query;

    if (!crowdId || !deviceId) {
      return res.status(400).json({
        message: 'Missing required fields: crowdId, deviceId',
        status: 400
      });
    }

    // Get all blocked users for this user in this crowd
    const blockedUsers = await GhostBlockedUser.find({
      crowdId,
      blockerDeviceId: deviceId
    });

    // Extract just the blocked device IDs
    const blockedDeviceIds = blockedUsers.map(bu => bu.blockedDeviceId);

    res.status(200).json({
      message: 'Blocked users retrieved successfully',
      status: 200,
      data: {
        blockedDeviceIds
      }
    });
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({
      message: `Failed due to ${error.message}`,
      status: 500
    });
  }
};

module.exports = {
  createCrowd,
  joinCrowd,
  getCrowdInfo,
  getActiveCrowds,
  getCrowdMembers,
  getCrowdMessages,
  sendMessage,
  deleteCrowd,
  leaveCrowd,
  removeMember,
  updateAdminStatus,
  toggleChatLock,
  uploadMedia,
  getDailyCrowdCount,
  pinMessage,
  unpinMessage,
  muteMember,
  unmuteMember,
  reportCrowd,
  reportMessage,
  blockUser,
  getBlockedUsers
};

