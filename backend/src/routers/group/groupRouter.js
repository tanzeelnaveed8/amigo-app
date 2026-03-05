const express = require('express');
const router = express.Router();
const {
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
} = require('../../controllers/group/groupController')
const { verifyToken } = require('../../middleware/jwtToken')
const { s3UploadMiddleware } = require('../../middleware/mediaUpload');

router.post('/create-group', verifyToken, createGroup)
router.patch('/update-group',verifyToken,updateGroup)
router.get('/get-group-info', verifyToken, getGroupInfo)
router.get('/get-group-id', verifyToken, getGroupById)
router.patch('/edit-group', verifyToken, editGroup)
router.post('/updateGroupProfile', verifyToken, s3UploadMiddleware,updateGroupProfile)
router.patch('/exist-from-group', verifyToken, existFromGroup)
router.patch('/remove-from-group',verifyToken,removeFromGroup)
router.patch('/add-member-in-group',verifyToken,AddUserInGroup)
router.patch('/add-member-in-group-as-an-admin',verifyToken,makeAdminInGroup)
router.delete('/delete-group/:groupId', verifyToken, deleteGroup);
router.get('/get-all-groups', verifyToken, getAllGroups);
router.patch('/ban-user-from-group', verifyToken, banUserFromGroup);
router.patch('/unban-user-from-group', verifyToken, unbanUserFromGroup);
module.exports = router