const express = require('express');
const router = express.Router();

const {
    updateUserProfile,
    checkUserContactOnAmigo,
    getUserListofUser,
    searchUser,
    getUserProfile,
    checkUserName,
    addUserInContactList,getUserListActiveWithChat,
    searchuserinContact,
    recheckUserContactOnAmigo
} = require('../../controllers/userProfile/userProfile')
const { verifyToken } = require('../../middleware/jwtToken')

router.patch('/update-user-profile', verifyToken, updateUserProfile)
router.post('/check-number-on-server', verifyToken, checkUserContactOnAmigo)
router.post('/re-check-number-on-server', verifyToken, recheckUserContactOnAmigo)

router.get('/get-user-list-of-user', verifyToken, getUserListofUser)
router.get('/search-user',verifyToken, searchUser)
router.get('/search-user-in-contact',verifyToken,searchuserinContact)
router.get('/get-user-profile', verifyToken, getUserProfile)
router.post('/search-user-name',verifyToken,checkUserName)
router.patch('/add-user-in-contact-list',verifyToken,addUserInContactList)
router.get('/get-chat-active-user-list',verifyToken,getUserListActiveWithChat)
module.exports = router