const { default: mongoose } = require("mongoose");
const Message = require("../../models/userChat/userMessage");
const { MessageModel } = require("../../models/userChat/ConversationModel");

const createMessage = async (req, res) => {
    const { chatroomId, recipient, text } = req.body;
    const userId = req.authData.userId
    let message
    let status
    try {
        const data = await Message.create({ chatroomId, sender: userId, recipient, text })
        if (data) {
            message = 'Chat created'
            status = 201
        } else {
            message = 'Chat Not Created'
            status = 401
        }
        res.status(201).json({
            messsage: message,
            data: data,
            status: status
        })
    } catch (error) {
        res.status(500).json({
            messsage: `Failed due to ${error}`
        })
    }
}

const getMessageByChatroomid = async (req, res) => {
    const chatroomId = req.query.chatroomId;
    let message
    let status
    try {
        const data = await Message.find({ chatroomId: chatroomId });
        if (data) {
            message = "Chats Found"
            status = 201
        } else {
            message = 'Chat Not Found'
            status = 401
        }
        res.status(201).json({
            messsage: message,
            data: data !== null ? data : [],
            status: status
        })
    } catch (error) {
        res.status(500).json({
            messsage: `Failed due to ${error}`
        })
    }
}

const editmessage = async (req, res) => {
    const { chatid, message } = req.body
    try {
        const data = await Message.findByIdAndUpdate(chatid, { text: message }, // New message value
            { new: true })
        // if (!updatedMessage) {
        //     return res.status(404).json({ message: "Message not found" });
        // }

        res.status(200).json({ message: "Message updated successfully", data: data });
    } catch (error) {
        res.status(500).json({
            messsage: `Failed due to ${error}`
        })
    }
}

const clearChatMessageByChatroomId = async (req, res) => {
    const { chatroomId } = req.body
    try {
        const data = await Message.deleteMany({ chatroomId: chatroomId });

        res.status(201).json({
            message: 'Chat History Clear',
        })
    } catch (error) {
        res.status(500).json({
            messsage: `Failed due to ${error}`
        })
    }
}
const addReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        console.log("Request Body:", req.body);

        const userId = req.authData.userId; // Assuming authentication middleware sets userId

        if (!messageId || !emoji) {
            return res.status(400).json({ message: "Message ID and emoji are required", status: false });
        }

        // Find the message
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found", status: false });
        }

        // Ensure reactions array exists
        if (!message.reactions) {
            message.reactions = [];
        }

        // Find the reaction with the same emoji
        const existingReactionIndex = message.reactions.findIndex(reaction => reaction.emoji === emoji);
        let updatedReactions = [...message.reactions];

        if (existingReactionIndex !== -1) {
            const existingReaction = updatedReactions[existingReactionIndex];
            const userIndex = existingReaction.userId.findIndex(id => id.toString() === userId.toString());

            if (userIndex !== -1) {
                // 🔹 If user already reacted, remove them
                existingReaction.userId.splice(userIndex, 1);
                existingReaction.emojiCount -= 1;
                
                if (existingReaction.emojiCount === 0) {
                    updatedReactions.splice(existingReactionIndex, 1); // Remove reaction if no users left
                }
            } else {
                // 🔹 If user is adding a reaction to an existing emoji
                existingReaction.userId.push(userId);
                existingReaction.emojiCount += 1;
            }
        } else {
            // 🔹 If it's a new emoji reaction, create a new object
            updatedReactions.push({ userId: [userId], emoji, emojiCount: 1 });
        }

        // Save updated reactions to the message
        message.reactions = updatedReactions;
        await message.save();

        res.status(200).json({
            message: "Reaction added/updated/removed successfully",
            status: true,
            reactions: message.reactions, // Updated reactions list
            reactionCount: message.reactions.length // Total number of reactions
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            message: `Failed due to ${error}`,
            status: false
        });
    }

}

const getReactions = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required", status: false });
        }

        // Find the message and populate userId field
        const message = await MessageModel.findById(messageId).populate('reactions.userId', '_id');
        if (!message) {
            return res.status(404).json({ message: "Message not found", status: false });
        }

        // Format reactions correctly
        const formattedReactions = message.reactions.map(reaction => ({
            userId: reaction.userId.map(user => user._id), // Keep all userIds who reacted
            emoji: reaction.emoji,
            emojiCount: reaction.userId.length, // Correct emoji count based on user array length
            _id: reaction._id
        }));

        res.status(200).json({
            message: "Reactions retrieved successfully",
            status: true,
            reactions: formattedReactions,
            reactionCount: formattedReactions.length, // Total number of distinct emoji reactions
            messageId: message.id
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            message: `Failed due to ${error}`,
            status: false
        });
    }
};

const addLikeDislike = async (req, res) => {
    try {
        const { messageId, action } = req.body;
        console.log("Request Body:", req.body);

        const userId = req.authData.userId; // Assuming authentication middleware sets userId

        if (!messageId || !action || !['like', 'dislike'].includes(action)) {
            return res.status(400).json({ 
                message: "Message ID and valid action (like/dislike) are required", 
                status: false 
            });
        }

        // Find the message
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found", status: false });
        }

        // Ensure likesDislikes array exists
        if (!message.likesDislikes) {
            message.likesDislikes = [];
        }

        // Find if like or dislike reaction already exists
        const existingLikeIndex = message.likesDislikes.findIndex(reaction => 
            reaction.action === 'like');
        const existingDislikeIndex = message.likesDislikes.findIndex(reaction => 
            reaction.action === 'dislike');
        
        let updatedLikesDislikes = [...message.likesDislikes];

        if (action === 'like') {
            // Handle like action
            if (existingLikeIndex !== -1) {
                const existingLike = updatedLikesDislikes[existingLikeIndex];
                const userIndex = existingLike.userId.findIndex(id => id.toString() === userId.toString());

                if (userIndex !== -1) {
                    // If user already liked, remove them (toggle off)
                    existingLike.userId.splice(userIndex, 1);
                    existingLike.count -= 1;
                    
                    if (existingLike.count === 0) {
                        updatedLikesDislikes.splice(existingLikeIndex, 1); // Remove like if no users left
                    }
                } else {
                    // If user is adding a like
                    existingLike.userId.push(userId);
                    existingLike.count += 1;
                    
                    // Remove user from dislike if exists
                    if (existingDislikeIndex !== -1) {
                        const existingDislike = updatedLikesDislikes[existingDislikeIndex];
                        const dislikeUserIndex = existingDislike.userId.findIndex(id => id.toString() === userId.toString());
                        
                        if (dislikeUserIndex !== -1) {
                            existingDislike.userId.splice(dislikeUserIndex, 1);
                            existingDislike.count -= 1;
                            
                            if (existingDislike.count === 0) {
                                updatedLikesDislikes.splice(existingDislikeIndex, 1); // Remove dislike if no users left
                            }
                        }
                    }
                }
            } else {
                // If it's a new like reaction, create a new object
                updatedLikesDislikes.push({ userId: [userId], action: 'like', count: 1 });
                
                // Remove user from dislike if exists
                if (existingDislikeIndex !== -1) {
                    const existingDislike = updatedLikesDislikes[existingDislikeIndex];
                    const dislikeUserIndex = existingDislike.userId.findIndex(id => id.toString() === userId.toString());
                    
                    if (dislikeUserIndex !== -1) {
                        existingDislike.userId.splice(dislikeUserIndex, 1);
                        existingDislike.count -= 1;
                        
                        if (existingDislike.count === 0) {
                            updatedLikesDislikes.splice(existingDislikeIndex, 1); // Remove dislike if no users left
                        }
                    }
                }
            }
        } else if (action === 'dislike') {
            // Handle dislike action
            if (existingDislikeIndex !== -1) {
                const existingDislike = updatedLikesDislikes[existingDislikeIndex];
                const userIndex = existingDislike.userId.findIndex(id => id.toString() === userId.toString());

                if (userIndex !== -1) {
                    // If user already disliked, remove them (toggle off)
                    existingDislike.userId.splice(userIndex, 1);
                    existingDislike.count -= 1;
                    
                    if (existingDislike.count === 0) {
                        updatedLikesDislikes.splice(existingDislikeIndex, 1); // Remove dislike if no users left
                    }
                } else {
                    // If user is adding a dislike
                    existingDislike.userId.push(userId);
                    existingDislike.count += 1;
                    
                    // Remove user from like if exists
                    if (existingLikeIndex !== -1) {
                        const existingLike = updatedLikesDislikes[existingLikeIndex];
                        const likeUserIndex = existingLike.userId.findIndex(id => id.toString() === userId.toString());
                        
                        if (likeUserIndex !== -1) {
                            existingLike.userId.splice(likeUserIndex, 1);
                            existingLike.count -= 1;
                            
                            if (existingLike.count === 0) {
                                updatedLikesDislikes.splice(existingLikeIndex, 1); // Remove like if no users left
                            }
                        }
                    }
                }
            } else {
                // If it's a new dislike reaction, create a new object
                updatedLikesDislikes.push({ userId: [userId], action: 'dislike', count: 1 });
                
                // Remove user from like if exists
                if (existingLikeIndex !== -1) {
                    const existingLike = updatedLikesDislikes[existingLikeIndex];
                    const likeUserIndex = existingLike.userId.findIndex(id => id.toString() === userId.toString());
                    
                    if (likeUserIndex !== -1) {
                        existingLike.userId.splice(likeUserIndex, 1);
                        existingLike.count -= 1;
                        
                        if (existingLike.count === 0) {
                            updatedLikesDislikes.splice(existingLikeIndex, 1); // Remove like if no users left
                        }
                    }
                }
            }
        }

        // Save updated likesDislikes to the message
        message.likesDislikes = updatedLikesDislikes;
        await message.save();

        // Extract like and dislike information for response
        const likeReaction = message.likesDislikes.find(reaction => reaction.action === 'like') || { count: 0, userId: [] };
        const dislikeReaction = message.likesDislikes.find(reaction => reaction.action === 'dislike') || { count: 0, userId: [] };

        res.status(200).json({
            message: `${action} added/updated/removed successfully`,
            status: true,
            likesDislikes: message.likesDislikes,
            likes: {
                count: likeReaction.count || 0,
                userLiked: likeReaction.userId ? likeReaction.userId.some(id => id.toString() === userId.toString()) : false
            },
            dislikes: {
                count: dislikeReaction.count || 0,
                userDisliked: dislikeReaction.userId ? dislikeReaction.userId.some(id => id.toString() === userId.toString()) : false
            }
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            message: `Failed due to ${error}`,
            status: false
        });
    }
}

const getLikeDislikeStatus = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ 
                message: "Message ID is required", 
                status: false 
            });
        }

        // Find the message and populate userId fields
        const message = await MessageModel.findById(messageId).populate('likesDislikes.userId', '_id');
        if (!message) {
            return res.status(404).json({ message: "Message not found", status: false });
        }

        // Ensure likesDislikes array exists
        const likesDislikes = message.likesDislikes || [];

        // Format likes/dislikes the same way as reactions
        const formattedLikesDislikes = likesDislikes.map(item => ({
            userId: item.userId.map(user => user._id), // Keep all userIds
            action: item.action, // 'like' or 'dislike'
            count: item.userId.length, // Correct count based on user array length
            _id: item._id
        }));

        res.status(200).json({
            message: "Likes and dislikes retrieved successfully",
            status: true,
            likesDislikes: formattedLikesDislikes,
            likeDislikeCount: formattedLikesDislikes.length, // Total number of distinct like/dislike actions
            messageId: message._id
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            message: `Failed due to ${error}`,
            status: false
        });
    }
};
const getBulkLikeDislikeStatus = async (req, res) => {
    try {
        const { messageId } = req.body; // Array of content IDs
        const userId = req.authData.userId;

        if (!messageId || !Array.isArray(messageId)) {
            return res.status(400).json({ 
                message: "Valid array of content IDs is required", 
                status: false 
            });
        }

        // Find all contents
        const contents = await MessageModel.find({
            _id: { $in: messageId }
        });

        // Build response with like/dislike info for each content
        const likesDislikesData = contents.map(content => {
            const likes = content.likes || [];
            const dislikes = content.dislikes || [];
            
            return {
                contentId: content._id,
                likes: {
                    count: likes.length,
                    userLiked: likes.some(id => id.toString() === userId.toString())
                },
                dislikes: {
                    count: dislikes.length,
                    userDisliked: dislikes.some(id => id.toString() === userId.toString())
                }
            };
        });

        res.status(200).json({
            status: true,
            data: likesDislikesData
        });

    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({
            message: `Failed due to ${error}`,
            status: false
        });
    }
}
const searchMessage = async (req, res) => {
    const searchquery = req.query.searchquery
    const chatroomId = req.query.chatroomId
    let message
    let status
    try {
        const data = await Message.find({ text: new RegExp(searchquery, 'i'), chatroomId: new mongoose.Types.ObjectId(chatroomId) })
        if (data.length > 0) {
            message = 'Messages Found'
            status = 201
        } else {
            message = 'Messages Not Found'
            status = 201
        }
        res.status(201).json({
            message: message,
            status: status,
            data: data
        })
    } catch (error) {
        res.status(500).json({
            messsage: `Failed due to ${error}`
        })
    }
}


module.exports = { createMessage, getMessageByChatroomid, editmessage, clearChatMessageByChatroomId, searchMessage, addReaction, getReactions ,addLikeDislike,getLikeDislikeStatus,getBulkLikeDislikeStatus};