const { default: mongoose } = require('mongoose');
const groupDB = require('../../models/group/group')
const Chatroom = require('../../models/userChat/userChatroom')
const { makeid } = require('../../utility/makeId');
const userCredentialDB = require('../../models/userAuth/userCredential');
const { ConversationModel } = require('../../models/userChat/ConversationModel')
const createGroup = async (req, res) => {
    const { groupType } = req.body;
    let data
    let message
    let status
    const userId = req.authData.userId
    try {

        data = await groupDB.create({ participants: [userId], groupType, groupAdmin: [userId], createdBy: userId })
        message = 'Group Inialised'
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
const updateGroup = async (req, res) => {
    const { groupId, bio, participants, title } = req.body;
    let message;
    let status;

    try {
        // Fetch the current group document
        const group = await groupDB.findById(groupId);

        if (!group) {
            message = 'Group Not Found';
            status = 404;
            return res.status(status).json({ message, status });
        }

        let updatedParticipants = [];

        // Merge the current participants with the new participants
        if (participants !== undefined) {
            updatedParticipants = [...new Set([...group.participants, ...participants])];
        }

        // Check if conversation exists for this group
        let existingConversation = await ConversationModel.findOne({
            groupId: groupId,
            conversationType: 'group'
        });

        // Create or update conversation when either title is updated or participants are added
        if (title !== undefined || participants !== undefined) {
            if (existingConversation) {
                // Update existing conversation with new participants
                await ConversationModel.findByIdAndUpdate(
                    existingConversation._id,
                    {
                        participents: updatedParticipants.length > 0 ? updatedParticipants : group.participants,
                        ...(title && { groupTitle: title }) // Update title if provided
                    }
                );
            } else {
                // Create new conversation
                await ConversationModel.create({
                    participents: updatedParticipants.length > 0 ? updatedParticipants : group.participants,
                    messages: [], // Empty message array
                    groupId: groupId,
                    conversationType: 'group',
                    ...(title && { groupTitle: title }) // Add title if provided
                });
            }
        }

        // Update the group with the new data
        const data = await groupDB.findByIdAndUpdate(groupId, {
            ...(bio !== undefined && { bio }),
            ...(participants !== undefined && { participants: updatedParticipants }),
            ...(title !== undefined && { title })
        }, { new: true });

        message = 'Group Updated';
        status = 200;

        res.status(status).json({
            message,
            status,
            data: data ? data._id : ''
        });

    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({
            message: `Failed due to ${error.message}`
        });
    }
};

const deleteGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        // Check if group exists
        const group = await groupDB.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found", status: false });
        }

        // Delete the group
        await groupDB.findByIdAndDelete(groupId);

        // Also delete from conversations if conversationType is 'group'
        await ConversationModel.deleteMany({ groupId, conversationType: "group" });

        return res.status(200).json({ message: "Group deleted successfully", status: true });
    } catch (error) {
        console.error("Error deleting group:", error);
        return res.status(500).json({ message: `Failed due to ${error}`, status: false });
    }
};

const getGroupById = async (req, res) => {
    const groupId = req.query.groupId;
    let data
    let message
    let status
    let userDatas
    try {
        const groupData = await groupDB.findOne({ _id: new mongoose.Types.ObjectId(groupId) }).populate('participants')
        // //// console.log({ groupData });
        if (groupData) {
            message = 'Group Info Found'
            status = 201
        } else {
            message = 'Group Info Not Found'
            status = 401
        }
        // if (data) {
        //     message='Group Info Found'
        //     status=201
        // } else {
        //     message='Group Info Not Found'
        //     status=401
        // }
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
const getGroupInfo = async (req, res) => {
    const userId = req.query.userId; // Get the userId from the query parameters
    try {
        // Find groups where the user is a participant
        const groupData = await groupDB.find({ participants: userId }).populate('participants');

        let message;
        let status;

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
            message: `Failed due to ${error.message}`,
        });
    }
};

const editGroup = async (req, res) => {
    const { groupId, bio, title } = req.body
    let data
    let message
    let status
    try {
        data = await groupDB.findByIdAndUpdate(groupId, { bio, title }, { new: true })
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
const updateGroupProfile = async (req, res) => {
    try {
        console.log("Request Headers:");  
        console.log("Request Body:", req.body);  // Check if groupId is received
        console.log("Uploaded Files:", req.files);  // Check uploaded files

        // Normalize and validate groupId coming from multipart/form-data
        const rawGroupId = req.body?.groupId;
        const groupId = typeof rawGroupId === 'string' ? rawGroupId.trim() : rawGroupId;

        if (!groupId || groupId === 'undefined' || groupId === 'null') {
            return res.status(400).json({ message: "groupId is required", status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "groupId must be a valid mongo id", status: 400 });
        }

        // Prefer files uploaded via S3 middleware
        // const uploadedFilesPaths = req?.files?.map(file => file?.location) || [];
        const uploadedFilesPaths = req?.uploadedFiles?.map(file => file?.location) || [];

        const group = await groupDB.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found", status: 404 });
        }

        if (uploadedFilesPaths.length === 0) {
            return res.status(400).json({ message: "No image uploaded", status: 400 });
        }

        const updatedGroup = await groupDB.findByIdAndUpdate(
            groupId,
            { groupProfile: uploadedFilesPaths[0] },
            { new: true }
        );

        return res.status(200).json({ message: "Group profile updated successfully", status: 200, data: updatedGroup });

    } catch (error) {
        return res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

const existFromGroup = async (req, res) => {
    const { groupId } = req.body
    // //// console.log({groupId});
    const userId = req.authData.userId
    let data
    let conversationData
    let message
    let status
    try {
        data = await groupDB.findOne({ _id: new mongoose.Types.ObjectId(groupId) })
        conversationData = await ConversationModel.findOne({ groupId: new mongoose.Types.ObjectId(groupId) })
        //// console.log({ data, conversationData });
        if (data && conversationData) {
            const participent = data.participants.filter((item) => item.toString() !== userId)
            const convParticipant = conversationData.participents.filter((item) => item.toString() !== userId)
            if (participent && convParticipant) {
                data.participants = participent
                conversationData.participents = convParticipant
                await conversationData.save()
                await data.save()
                message = 'User Exist From Group'
                status = 201
            }
        } else {
            message = 'Group Not Found with id'
            status = 401
        }

        res.status(status).json({
            message: message,
            status: status
        })
    } catch (error) {
        //// console.log({ error }, 'tttt');
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const removeFromGroup = async (req, res) => {
    const { groupId, userId } = req.body
    let data
    let conversationData

    let message
    let status
    try {
        data = await groupDB.findOne({ _id: new mongoose.Types.ObjectId(groupId) })
        conversationData = await ConversationModel.findOne({ groupId: new mongoose.Types.ObjectId(groupId) })
        //// console.log({ data, conversationData }, 'dadaaaaa');
        if (data && conversationData) {

            const participent = data.participants.filter((item) => item.toString() !== userId)
            const convParticipant = conversationData.participents.filter((item) => item.toString() !== userId)
            if (participent && convParticipant) {
                data.participants = participent
                conversationData.participents = convParticipant
                await conversationData.save()
                await data.save()
                message = 'User Exist From Group'
                status = 201
            }
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

const AddUserInGroup = async (req, res) => {
    const { groupId, userId } = req.body
    //// console.log({groupId, userId});
    let data
    let conversationData

    let message
    let status
    try {
        data = await groupDB.findOne({ _id: new mongoose.Types.ObjectId(groupId) })
        conversationData = await ConversationModel({groupId: new mongoose.Types.ObjectId(groupId)})
        if (data && conversationData) {
           //// console.log({participent:conversationData});
                // Ensure userId is an array (if it's not already)
                const usersToAdd = Array.isArray(userId) ? userId : [userId];
                // const userAddInConv=Array.isArray(userId) ? userId :[userId];
                // Push the array of user IDs into the participants array
                data.participants.push(...usersToAdd);
                conversationData.participents.push(...usersToAdd);

                // Save the updated group data
                await conversationData.save()
                await data.save();
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
        //// console.log({error});
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
const makeAdminInGroup = async (req, res) => {
    const { groupId, userId } = req.body;
    let data
    let conversationData
    let message
    let status
    try {
        data = await groupDB.findOne({ _id: new mongoose.Types.ObjectId(groupId) })
        conversationData = await ConversationModel({groupId: new mongoose.Types.ObjectId(groupId)})
        if (data && conversationData) {
            const usersToMakeAdmin = Array.isArray(userId) ? userId : [userId];

            // Push the array of user IDs into the groupAdmin array
            data.groupAdmin.push(...usersToMakeAdmin);
            conversationData.participents.push(...usersToMakeAdmin);


            // Save the updated group data
            await data.save();
            message = 'User Added as an Admin'
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

const getAllGroups = async (req, res) => {
    try {
        const { page = 1, limit = 10, groupType, search } = req.query;
        
        // Build filter object
        let filter = {};
        
        // Filter by group type if provided
        if (groupType) {
            filter.groupType = groupType;
        }
        
        // Search functionality (search in title, bio)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get groups with pagination and populate participants
        const groups = await groupDB.find(filter)
            .populate('participants', 'firstName lastName userName userProfile')
            .populate('groupAdmin', 'firstName lastName userName userProfile')
            .populate('createdBy', 'firstName lastName userName userProfile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalGroups = await groupDB.countDocuments(filter);
        const totalPages = Math.ceil(totalGroups / parseInt(limit));

        let message;
        let status;

        if (groups && groups.length > 0) {
            message = 'Groups retrieved successfully';
            status = 200;
        } else {
            message = 'No groups found';
            status = 200;
        }

        res.status(status).json({
            message,
            status,
            data: groups,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalGroups,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get all groups error:', error);
        res.status(500).json({
            message: `Failed due to ${error.message}`,
            status: 500
        });
    }
};

const banUserFromGroup = async (req, res) => {
    const { groupId, userId } = req.body;
    const adminId = req.authData.userId;
    try {
        const group = await groupDB.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found', status: 404 });
        }
        if (!group.groupAdmin.some(id => id.toString() === adminId)) {
            return res.status(403).json({ message: 'Only admins can ban users', status: 403 });
        }
        if (group.groupAdmin.some(id => id.toString() === userId)) {
            return res.status(400).json({ message: 'Cannot ban an admin', status: 400 });
        }

        group.participants = group.participants.filter(id => id.toString() !== userId);
        if (!group.bannedUsers.some(id => id.toString() === userId)) {
            group.bannedUsers.push(userId);
        }
        await group.save();

        const conversation = await ConversationModel.findOne({ groupId, conversationType: 'group' });
        if (conversation) {
            conversation.participents = conversation.participents.filter(id => id.toString() !== userId);
            await conversation.save();
        }

        res.status(200).json({ message: 'User banned from group', status: 200, data: group });
    } catch (error) {
        res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

const unbanUserFromGroup = async (req, res) => {
    const { groupId, userId } = req.body;
    const adminId = req.authData.userId;
    try {
        const group = await groupDB.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found', status: 404 });
        }
        if (!group.groupAdmin.some(id => id.toString() === adminId)) {
            return res.status(403).json({ message: 'Only admins can unban users', status: 403 });
        }

        group.bannedUsers = group.bannedUsers.filter(id => id.toString() !== userId);
        await group.save();

        res.status(200).json({ message: 'User unbanned from group', status: 200, data: group });
    } catch (error) {
        res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

module.exports = {
    createGroup,
    getGroupInfo,
    getGroupById,
    editGroup,
    existFromGroup,
    removeFromGroup,
    AddUserInGroup,
    makeAdminInGroup,
    updateGroup,
    deleteGroup,
    updateGroupProfile,
    getAllGroups,
    banUserFromGroup,
    unbanUserFromGroup
}