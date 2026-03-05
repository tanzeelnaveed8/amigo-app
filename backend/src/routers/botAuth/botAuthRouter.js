const express = require('express');
const router = express.Router();
const {botAuth,ceateUserCredentialByBot,sendOTPWithEmailByBot}=require('../../controllers/botAuth/botAuthcontroller')
const {verifyToken}=require('../../middleware/jwtToken')

router.post('/bot-chat-started',botAuth)
router.post('/create-user-by-bot',ceateUserCredentialByBot)
router.post('/update-user-email-by-bot',verifyToken,sendOTPWithEmailByBot)



module.exports=router
