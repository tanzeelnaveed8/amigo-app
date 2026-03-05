const { default: mongoose } = require('mongoose');
const chanelDB = require('../../models/chanel/chanel')
const Chatroom = require('../../models/userChat/userChatroom')
const { ConversationModel } = require('../../models/userChat/ConversationModel')

const createChanel = async (req, res) => {
    const { chanelType } = req.body;
    let data
    let message
    let status
    const userId = req.authData.userId
    try {

        data = await chanelDB.create({ participants: [userId], chanelType, chanelAdmin: [userId], createdBy: userId })
        message = 'Chanel Inialised'
        status = 201
        //// console.log({ data });
        res.status(201).json({
            message: message,
            status: status,
            data: data !== null || data !== undefined ? data._id : ''
        })

    } catch (error) {
        //// console.log({ error });
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const updateChanel = async (req, res) => {
    const { chanelId, bio, participants, title, username } = req.body;
    let message;
    let status;

    try {
        // Fetch the current chanel document
        const chanel = await chanelDB.findById(chanelId);
        if (!chanel) {
            return res.status(404).json({ message: 'Chanel Not Found', status: 404 });
        }

        let updatedParticipants = chanel.participants;
        
        // Merge the current participants with the new participants
        if (participants !== undefined) {
            updatedParticipants = [...new Set([...chanel.participants, ...participants])];
        }

        // Check if conversation exists for this chanel
        let existingConversation = await ConversationModel.findOne({
            chanelId: chanelId,
            conversationType: 'chanel'
        });

        // If title or participants are updated, modify the existing conversation
        if (title !== undefined || participants !== undefined) {
            if (existingConversation) {
                await ConversationModel.findByIdAndUpdate(
                    existingConversation._id,
                    {
                        participents: updatedParticipants.length > 0 ? updatedParticipants : chanel.participants,
                        ...(title && { groupTitle: title }) // Update title if provided
                    }
                );
            } else {
                // If no conversation exists, create a new one
                await ConversationModel.create({
                    participents: updatedParticipants.length > 0 ? updatedParticipants : chanel.participants,
                    messages: [],  // Empty message array
                    chanelId: chanelId,
                    conversationType: 'chanel',
                    ...(title && { groupTitle: title }) // Add title if provided
                });
            }
        }

        // Update the chanel with the new data
        const data = await chanelDB.findByIdAndUpdate(
            chanelId,
            {
                ...(bio !== undefined && { bio }),
                ...(participants !== undefined && { participants: updatedParticipants }),
                ...(title !== undefined && { title }),
                ...(username !== undefined && { username })
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Chanel Updated',
            status: 200,
            data: data ? data._id : ''
        });

    } catch (error) {
        console.error('Update chanel error:', error);
        res.status(500).json({
            message: `Failed due to ${error.message}`
        });
    }
};


const getChanelInfoByID = async (req, res) => {
    const chanelId = req.query.chanelId;
    let data
    let message
    let status
    let userDatas
    try {
        const groupData = await chanelDB.findById(chanelId).populate('participants')
        //// console.log({ groupData });
        if (groupData) {
            message = 'Group Info Found'
            status = 201
        } else {
            message = 'Group Info Not Found'
            status = 401
        }

        res.status(status).json({
            message: message,
            status: status,
            data: groupData
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}

const deleteChanel = async (req, res) => {
    const { chanelId } = req.params;
    const userId = req.authData.userId; // Assuming you have user authentication
  //// console.log("chanellelellel",chanelId);
  
    try {
      const chanel = await chanelDB.findById(chanelId);
  
      if (!chanel) {
        return res.status(404).json({
          message: "Channel not found",
          status: 404,
        });
      }
  
      // Check if the user is the creator or admin
      if (
        chanel.createdBy.toString() !== userId &&
        !chanel.chanelAdmin.includes(userId)
      ) {
        return res.status(403).json({
          message: "You are not authorized to delete this channel",
          status: 403,
        });
      }
  
      // Delete channel-related conversations
      await ConversationModel.deleteMany({ chanelId, conversationType: "chanel" });
  
      // Delete the channel
      await chanelDB.findByIdAndDelete(chanelId);
  
      res.status(200).json({
        message: "Channel and related conversations deleted successfully",
        status: 200,
      });
    } catch (error) {
      console.error("Error deleting channel:", error);
      res.status(500).json({
        message: `Failed due to ${error.message}`,
        status: 500,
      });
    }
  };

const getChanelInfo = async (req, res) => {
    const userId = req.query.userId;
   
    try {
        const groupData = await chanelDB.find({ participants: userId }).populate('participants');
        let message;
        let status;
        //// console.log({ groupData });
        if (groupData && groupData.length > 0) {
            message = 'Groups Found';
            status = 201;
        } else {
            message = 'No Groups Found for the User';
            status = 201;
        }

        res.status(status).json({
            message,
            status,
            data: groupData,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const editChanel = async (req, res) => {
    const { chanelId, bio, title, username } = req.body
    let data
    let message
    let status
    try {
        data = await chanelDB.findByIdAndUpdate(chanelId, { ...(bio !== undefined && { bio }), ...(title !== undefined && { title }), ...(username !== undefined && { username }) }, { new: true })
        if (data) {
            message = 'Updated Successfully'
            status = 201
        } else {
            message = 'Failed to Update'
            status = 401
        }
        res.status(status).json({
            message: message,
            status: status
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const updateChanelProfile = async (req, res) => {
    try {
        console.log("Request Body:", req.body);  // Debugging logs
        console.log("Uploaded Files:", req.files);  

        const { chanelId } = req.body;
        const uploadedFilesPaths = req?.uploadedFiles?.map(file => file?.location) || [];

        if (!chanelId) {
            return res.status(200).json({ message: "chanelId is required", status: 400 });
        }

        // Check if the channel exists
        const chanel = await chanelDB.findById(chanelId);
        if (!chanel) {
            return res.status(200).json({ message: "Channel not found", status: 404 });
        }

        // Ensure an image file is uploaded
        if (uploadedFilesPaths.length === 0) {
            return res.status(200).json({ message: "No image uploaded", status: 400 });
        }

        // Update the channel profile image
        const updatedChanel = await chanelDB.findByIdAndUpdate(
            chanelId,
            { chanelProfile: uploadedFilesPaths[0] },
            { new: true }
        );

        return res.status(200).json({ message: "Channel profile updated successfully", status: 200, data: updatedChanel });

    } catch (error) {
        return res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

const existFromChanel = async (req, res) => {
    const { chanelId } = req.body
    const userId = req.authData.userId

    let data
    let conversationData

    let message
    let status
    try {
        data = await chanelDB.findOne({ _id: new mongoose.Types.ObjectId(chanelId) })
        conversationData = await ConversationModel.findOne({ chanelId: new mongoose.Types.ObjectId(chanelId) })

        // //// console.log({ data });
        if (data && conversationData) {

            const participent = data.participants.filter((item) => item.toString() !== userId)
            const convParticipant = conversationData.participents.filter((item) => item.toString() !== userId)

            // //// console.log({chatroomFilterData});
            if (participent || convParticipant) {
                data.participants = participent
                conversationData.participents = convParticipant
                await conversationData.save()
                await data.save()
                message = 'User Exist From Group'
                status = 201
            }
        } else {
            message = 'Group Not Found with id'
            status = 201
        }

        res.status(status).json({
            message: message,
            status: status
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const removeFromChanel = async (req, res) => {
    const { chanelId, userId } = req.body;
    //// console.log({chanelId,userId});
    let data
    let conversationData

    let message
    let status
    try {
        data = await chanelDB.findOne({ _id: new mongoose.Types.ObjectId(chanelId) })
        conversationData = await ConversationModel.findOne({ chanelId: new mongoose.Types.ObjectId(chanelId) })

        // //// console.log({ data });
        if (data && conversationData) {
            const convParticipant = conversationData.participents.filter((item) => item.toString() !== userId)

            const participent = data.participants.filter((item) => item.toString() !== userId)

            data.participants = participent
            conversationData.participents = convParticipant
            await conversationData.save()
            await data.save()
            message = 'User Exist From Group'
            status = 201

        } else {
            message = 'Group Not Found with id'
            status = 401
        }
        res.status(status).json({
            message: message,
            status: status
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const AddUserInChanel = async (req, res) => {
    const { chanelId, userId } = req.body
    let data
    let conversationData

    let message
    let status
    try {
        data = await chanelDB.findOne({ _id: new mongoose.Types.ObjectId(chanelId) })
        conversationData = await ConversationModel.findOne({ chanelId: new mongoose.Types.ObjectId(chanelId) })

        if (data) {
            const usersToAdd = Array.isArray(userId) ? userId : [userId];
            data.participants.push(...usersToAdd)
            conversationData.participents.push(...usersToAdd)
            await data.save()
            await conversationData.save()
            message = 'User Added in Group'
            status = 201

        } else {
            message = 'Group Not Found'
            status = 401
        }
        res.status(status).json({
            message: message,
            status: status
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
// const makeAdminInChanel = async (req, res) => {
//     const { chanelId, userId } = req.body;
//     let data
//     let conversationData

//     let message
//     let status
//     try {
//         data = await chanelDB.findOne({ _id: new mongoose.Types.ObjectId(chanelId) })
//         conversationData = await ConversationModel.findOne({ chanelId: new mongoose.Types.ObjectId(chanelId) })

//         if (data) {
//             const usersToAdd = Array.isArray(userId) ? userId : [userId];
//             data.chanelAdmin.push(...usersToAdd)
//             conversationData.participents.push(...usersToAdd)
//             await data.save()
//             await conversationData.save()
//             message = 'User Added as an Admin'
//             status = 201
//         } else {
//             message = 'Group Not Found'
//             status = 401
//         }
//         res.status(status).json({
//             message: message,
//             status: status
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: `Failed due to ${error}`
//         })
//     }
// }
const makeAdminInChanel = async (req, res) => {
    const { chanelId, userId } = req.body;
    let data;
    let conversationData;
    let message;
    let status;

    try {
        // Find the channel data
        data = await chanelDB.findOne({ _id: new mongoose.Types.ObjectId(chanelId) });
        if (!data) {
            return res.status(401).json({
                message: 'Group Not Found',
                status: 401
            });
        }

        // Find the conversation data
        conversationData = await ConversationModel.findOne({ chanelId: new mongoose.Types.ObjectId(chanelId) });

        // If conversation data doesn't exist, handle it
        if (!conversationData) {
            conversationData = new ConversationModel({
                chanelId: new mongoose.Types.ObjectId(chanelId),
                participents: [],
            });
        }

        // Add users as channel admins and conversation participants
        const usersToAdd = Array.isArray(userId) ? userId : [userId];
        data.chanelAdmin.push(...usersToAdd);
        conversationData.participents.push(...usersToAdd);

        // Save the changes
        await data.save();
        await conversationData.save();

        message = 'User Added as an Admin';
        status = 201;

        res.status(status).json({
            message: message,
            status: status
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error.message}`
        });
    }
};

const banUserFromChanel = async (req, res) => {
    const { chanelId, userId } = req.body;
    const adminId = req.authData.userId;
    try {
        const chanel = await chanelDB.findById(chanelId);
        if (!chanel) {
            return res.status(404).json({ message: 'Channel not found', status: 404 });
        }
        if (!chanel.chanelAdmin.some(id => id.toString() === adminId)) {
            return res.status(403).json({ message: 'Only admins can ban users', status: 403 });
        }
        if (chanel.chanelAdmin.some(id => id.toString() === userId)) {
            return res.status(400).json({ message: 'Cannot ban an admin', status: 400 });
        }

        chanel.participants = chanel.participants.filter(id => id.toString() !== userId);
        if (!chanel.bannedUsers.some(id => id.toString() === userId)) {
            chanel.bannedUsers.push(userId);
        }
        await chanel.save();

        const conversation = await ConversationModel.findOne({ chanelId, conversationType: 'chanel' });
        if (conversation) {
            conversation.participents = conversation.participents.filter(id => id.toString() !== userId);
            await conversation.save();
        }

        res.status(200).json({ message: 'User banned from channel', status: 200, data: chanel });
    } catch (error) {
        res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

const unbanUserFromChanel = async (req, res) => {
    const { chanelId, userId } = req.body;
    const adminId = req.authData.userId;
    try {
        const chanel = await chanelDB.findById(chanelId);
        if (!chanel) {
            return res.status(404).json({ message: 'Channel not found', status: 404 });
        }
        if (!chanel.chanelAdmin.some(id => id.toString() === adminId)) {
            return res.status(403).json({ message: 'Only admins can unban users', status: 403 });
        }

        chanel.bannedUsers = chanel.bannedUsers.filter(id => id.toString() !== userId);
        await chanel.save();

        res.status(200).json({ message: 'User unbanned from channel', status: 200, data: chanel });
    } catch (error) {
        res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

module.exports = {
    createChanel,
    getChanelInfo,
    getChanelInfoByID,
    editChanel,
    existFromChanel,
    removeFromChanel,
    AddUserInChanel,
    makeAdminInChanel,
    updateChanel,
    deleteChanel,
    updateChanelProfile,
    banUserFromChanel,
    unbanUserFromChanel
}