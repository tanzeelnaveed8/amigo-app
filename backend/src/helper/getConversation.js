const { default: mongoose } = require("mongoose")
const { ConversationModel } = require("../models/userChat/ConversationModel")

const getConversation = async (data) => {
    // console.log("data ifff",data);
    let query={}

    // Validate currentUserId is a valid string before creating ObjectId
    if (data.currentUserId && typeof data.currentUserId === 'string' && data.currentUserId.trim() !== '') {
        try {
            query={
                participents:{'$in':[new mongoose.Types.ObjectId(data.currentUserId)]}
            }
        } catch (error) {
            console.error('Invalid currentUserId:', data.currentUserId, error.message);
            return [];
        }
    } else if (data.conversationId && typeof data.conversationId === 'string' && data.conversationId.trim() !== '') {
        try {
            query={
                _id:new mongoose.Types.ObjectId(data.conversationId)
            }
        } catch (error) {
            console.error('Invalid conversationId:', data.conversationId, error.message);
            return [];
        }
    } else {
        console.error('Invalid data provided to getConversation:', data);
        return [];
    }
    
    if (data.currentUserId || data.conversationId ) {
        // console.log("going to ifff");
        // console.log('query',query);
        
        const currentUserConversation = await ConversationModel.find(data.currentUserId?query:{}).sort({ updatedAt: -1 }).populate('messages').populate('participents').populate('groupId').populate('chanelId')
        // // console.log({ currentUserConversation :currentUserConversation[0]});
        const conversation = currentUserConversation.map((conv) => {
            // // console.log("conversation conv", conv);
            
            let userid;
            try {
                userid = new mongoose.Types.ObjectId(data.currentUserId);
            } catch (error) {
                console.error('Invalid currentUserId in map function:', data.currentUserId, error.message);
                return null;
            }
            const participantdata=conv.participents.filter((item)=>!item.equals(userid))
            // // console.log({currentUserConversation});
            const countUnseenMsg = conv?.messages?.reduce((preve, curr) => {
                const msgByUserId = curr?.msgByUserId?.toString()

                if (msgByUserId !== data.currentUserId) {
                    return preve + (curr?.seen ? 0 : 1)
                } else {
                    return preve
                }

            }, 0)

            return {
                _id: conv?._id,
                sender: conv?.sender,
                receiver: conv?.receiver,
                unseenMsg: countUnseenMsg,
                blockUser:conv.blockUser,
                lastMsg: conv.messages[conv?.messages?.length - 1],
                group:conv.groupId,
                chanel:conv.chanelId,
                userData:participantdata,
                bannedUsers: conv.groupId?.bannedUsers || conv.chanelId?.bannedUsers || []
            }
        }).filter(conv => conv !== null)
        // console.log("conversation iff",{conversation});
        return conversation
    } else {
        return []
    }
}

const getGroupConversation = async (conversationId,currentUserId) => {
    // // console.log('cccccccccccc',{conversationId});
    if (conversationId && typeof conversationId === 'string' && conversationId.trim() !== '') {
        try {
            const currentUserConversation = await ConversationModel.find({_id:new mongoose.Types.ObjectId(conversationId) }).sort({ updatedAt: -1 }).populate('messages').populate('participents').populate('groupId').populate('chanelId')
        // // console.log({ cct :currentUserConversation});
        const conversation = currentUserConversation?.map((conv) => {
            // // console.log({conv});
            // const userid=new mongoose.Types.ObjectId(currentUserId)
            // const data=conv.participents.filter((item)=>!item.equals(userid))
            // // console.log({currentUserConversation});
            const countUnseenMsg = conv?.messages?.reduce((preve, curr) => {
                const msgByUserId = curr?.msgByUserId?.toString()

                if (msgByUserId !== currentUserId) {
                    return preve + (curr?.seen ? 0 : 1)
                } else {
                    return preve
                }

            }, 0)

            return {
                _id: conv?._id,
                sender: conv?.sender,
                receiver: conv?.receiver,
                unseenMsg: countUnseenMsg,
                blockUser:conv.blockUser,
                lastMsg: conv.messages[conv?.messages?.length - 1],
                group:conv.groupId,
                chanel:conv.chanelId,
                // userData:data
            }
        })
        // // console.log({conversation});
        return conversation
        } catch (error) {
            console.error('Invalid conversationId:', conversationId, error.message);
            return [];
        }
    } else {
        console.error('Invalid conversationId provided to getGroupConversation:', conversationId);
        return []
    }
}

module.exports = {getConversation,getGroupConversation}
// module.exports=getGroupConversation

// .populate({
//     path:"groupId",
//     match:{
//         participants: { $in: new mongoose.Types.ObjectId(currentUserId) }
//     }
// })