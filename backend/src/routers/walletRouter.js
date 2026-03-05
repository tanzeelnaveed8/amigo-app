const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/jwtToken');
const { upload } = require('../utility/aws');
const {
  listWalletItems,
  uploadWalletItem,
  deleteWalletItem,
  getWalletItemDownloadUrl,
  downloadWalletItem,
  renameWalletItem,
} = require('../controllers/wallet/walletController');

router.use(verifyToken);

router.get('/list', listWalletItems);
router.post('/upload', upload.single('file'), uploadWalletItem);
router.delete('/item/:itemId', deleteWalletItem);
router.get('/item/:itemId/download-url', getWalletItemDownloadUrl);
router.get('/item/:itemId/download', downloadWalletItem);
router.patch('/item/:itemId/rename', renameWalletItem);

module.exports = router;
