const express = require('express');
const { createChanel, updateChanel, getChanelInfo,getChanelInfoByID, editChanel, existFromChanel, removeFromChanel, AddUserInChanel, makeAdminInChanel, deleteChanel,updateChanelProfile, banUserFromChanel, unbanUserFromChanel } = require('../../controllers/chanel/chanelController');
const { verifyToken } = require('../../middleware/jwtToken');
const router = express.Router();
const { s3UploadMiddleware } = require('../../middleware/mediaUpload');
router.post('/create-chanel',verifyToken,createChanel)
router.patch('/update-chanel',verifyToken,updateChanel)
router.get('/get-chanel-info',verifyToken,getChanelInfo)
router.get('/get-chanel-id',verifyToken,getChanelInfoByID)
router.patch('/edit-chanel',verifyToken,editChanel)
router.post('/updateChanelProfile',s3UploadMiddleware,updateChanelProfile)
router.patch('/exist-from-chanel', verifyToken, existFromChanel)
router.patch('/remove-from-chanel',verifyToken,removeFromChanel)
router.patch('/add-member-in-chanel',verifyToken,AddUserInChanel)
router.delete('/delete-chanel/:chanelId', verifyToken, deleteChanel);

router.patch('/add-member-in-chanel-as-an-admin',verifyToken,makeAdminInChanel)
router.patch('/ban-user-from-chanel', verifyToken, banUserFromChanel)
router.patch('/unban-user-from-chanel', verifyToken, unbanUserFromChanel)

module.exports = router
