const Chat = require("../../models/userChat/userChatroom");
const {makeid}=require('../../utility/makeId')
const createChatroom = async (req, res) => {
    const { participants, chatRoomType } = req.body;
    let data
    let message
    let Newdata
    const userId = req.authData.userId
    const participent=[userId,participants[0]]
    try {
         data=await Chat.findOne({ participants: { $all: participent } })
        if (data) {
            message='Chatroom already created'
        } else {
            const name = `chatroom_${makeid(10)}`
             Newdata = await Chat.create({ participants:participent, name, chatRoomType })
             message='chatroom created'
        }
       
        res.status(201).json({
            message:message ,
            data: data !==null ? data._id : Newdata._id
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`,
            

        })
    }
}



// get chatroom that have type "OneToOne"
const getChatroomId = async (req, res) => {
    const recieverUserId = req.query.recieverUserId;
    const userId = req.authData.userId
    let data = []
    let message
    let status
    let chatroomid
    try {
        data = await Chat.findOne({ participants: { $all: [recieverUserId, userId] }, chatRoomType: 'OneToOne' })
        if (data) {
            message = 'chatroom id found'
            status = '201'
            chatroomid = data._id
        } else {
            message = 'chatroom id not found'
            status = '401'
            chatroomid = ''
        }


        res.status(201).json({
            message: message,
            status: status,
            data: chatroomid
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}

const blockedUser = async (req, res) => {
    const {blockedUserId,chatroomId}=req.body
    let message
    try {
       const data=await Chat.findById(chatroomId)
       if (data) {
         data.blockedUser=blockedUserId
         message='User Blocked'
         await data.save()
       }else{
         message='Chatroom not found'
       }
       res.status(201).json({
        message:message,
        data:data
       })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}


module.exports = { createChatroom, getChatroomId ,blockedUser}