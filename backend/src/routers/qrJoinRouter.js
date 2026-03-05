const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/jwtToken');
const { getQrPayload, joinByQr } = require('../controllers/qrJoin/qrJoinController');

router.get('/payload', verifyToken, getQrPayload);
router.post('/join', verifyToken, joinByQr);

module.exports = router;
