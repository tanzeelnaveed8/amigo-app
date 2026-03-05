const express = require("express");
const router = express.Router();
const {
  createCrowd,
  joinCrowd,
  getCrowdInfo,
  getActiveCrowds,
  getCrowdMembers,
  getCrowdMessages,
  sendMessage,
  deleteCrowd,
  leaveCrowd,
  removeMember,
  updateAdminStatus,
  toggleChatLock,
  uploadMedia,
  getDailyCrowdCount,
  pinMessage,
  unpinMessage,
  muteMember,
  unmuteMember,
  reportCrowd,
  reportMessage,
  blockUser,
  getBlockedUsers
} = require('../../controllers/ghost/ghostCrowdController');

const { s3UploadMiddleware } = require('../../middleware/mediaUpload');

// No JWT middleware - ghost mode is anonymous

// 1. Create Crowd
router.post('/create-crowd', createCrowd);

// 2. Join Crowd
router.post('/join-crowd', joinCrowd);

// 3. Get Crowd Info
router.get('/get-crowd-info', getCrowdInfo);

// 4. Get Active Crowds
router.get('/get-active-crowds', getActiveCrowds);

// 5. Get Crowd Members
router.get('/get-crowd-members', getCrowdMembers);

// 6. Get Crowd Messages
router.get('/get-crowd-messages', getCrowdMessages);

// 7. Send Message
router.post('/send-message', sendMessage);

// 8. Delete Crowd
router.delete('/delete-crowd', deleteCrowd);

// 9. Leave Crowd
router.post('/leave-crowd', leaveCrowd);

// 10. Remove Member
router.post('/remove-member', removeMember);

// 11. Promote/Demote Admin
router.post('/update-admin-status', updateAdminStatus);

// 12. Toggle Chat Lock
router.post('/toggle-chat-lock', toggleChatLock);

// 13. Upload Media (Ghost Mode - no JWT required)
router.post('/upload-media', s3UploadMiddleware, uploadMedia);

// 14. Get Daily Crowd Creation Count
router.get('/get-daily-crowd-count', getDailyCrowdCount);

// 15. Pin Message
router.post('/pin-message', pinMessage);

// 16. Unpin Message
router.post('/unpin-message', unpinMessage);

// 17. Mute Member
router.post('/mute-member', muteMember);

// 18. Unmute Member
router.post('/unmute-member', unmuteMember);

// 19. Report Crowd
router.post('/report-crowd', reportCrowd);

// 20. Report Message
router.post('/report-message', reportMessage);

// 21. Block User
router.post('/block-user', blockUser);

// 22. Get Blocked Users
router.get('/get-blocked-users', getBlockedUsers);

module.exports = router;


