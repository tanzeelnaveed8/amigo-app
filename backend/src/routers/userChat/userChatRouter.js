const express = require("express");
const router = express.Router();
const {createChatroom,getChatroomId,blockedUser}=require('../../controllers/userChat/userChat')
const {createMessage,getMessageByChatroomid,editmessage,clearChatMessageByChatroomId,searchMessage,addReaction,getReactions,addLikeDislike,getLikeDislikeStatus,getBulkLikeDislikeStatus}=require('../../controllers/userChat/userMessage')
const {verifyToken}=require('../../middleware/jwtToken')

router.post('/create-chatroom',verifyToken,createChatroom)
router.post('/addReaction',verifyToken,addReaction)
router.get('/getReactions/:messageId',verifyToken,getReactions)
router.post('/addLikeDislike',verifyToken,addLikeDislike)
router.get('/getLikeDislikeStatus/:messageId',verifyToken,getLikeDislikeStatus)
router.get('/getBulkLikeDislikeStatus',verifyToken,getBulkLikeDislikeStatus)
router.get('/get-chatroom-id',verifyToken,getChatroomId)
router.post('/create-message',verifyToken,createMessage)
router.get('/get-chat-message-by-id',verifyToken,getMessageByChatroomid)
router.patch('/update-message',verifyToken,editmessage)
router.post('/clear-chat-history',verifyToken,clearChatMessageByChatroomId)
router.patch('/blocked-user',verifyToken,blockedUser)
router.get('/search-message',searchMessage)

module.exports=router

