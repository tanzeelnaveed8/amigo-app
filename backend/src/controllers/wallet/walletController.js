const AmigoWalletDB = require('../../models/wallet/amigoWallet');
const { s3Client, bucketName } = require('../../utility/aws');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { encryptBuffer, decryptBuffer } = require('../../utility/walletEncryption');
const httpStatus = require('http-status');
const AppError = require('../../utility/appError');

const MAX_ITEMS = 30;
const MAX_STORAGE_BYTES = 300 * 1024 * 1024; // 300 MB
const WALLET_S3_PREFIX = 'amigo-wallet/';

async function getOrCreateWallet(userId) {
  let wallet = await AmigoWalletDB.findOne({ userId });
  if (!wallet) {
    wallet = await AmigoWalletDB.create({ userId, items: [], totalSizeBytes: 0 });
  }
  return wallet;
}

exports.listWalletItems = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const wallet = await getOrCreateWallet(userId);
    const items = (wallet.items || []).map((item) => ({
      id: item._id.toString(),
      name: item.name,
      type: item.type,
      sizeBytes: item.sizeBytes,
      size: (item.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB',
      createdAt: item.createdAt,
      mimeType: item.mimeType,
    }));
    const totalSizeBytes = wallet.totalSizeBytes || 0;
    return res.status(200).json({
      success: true,
      data: {
        items,
        totalSizeBytes,
        totalItems: items.length,
        maxItems: MAX_ITEMS,
        maxStorageBytes: MAX_STORAGE_BYTES,
      },
    });
  } catch (error) {
    console.error('listWalletItems error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to list wallet items',
    });
  }
};

exports.uploadWalletItem = async (req, res) => {
  try {
    const userId = req.authData.userId;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Use multipart field "file".',
      });
    }
    const originalName = (req.body.name || req.file.originalname || 'document').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileType = req.file.mimetype || 'application/octet-stream';
    const type = fileType.startsWith('image/') ? 'image' : 'document';
    const sizeBytes = req.file.buffer.length;

    const wallet = await getOrCreateWallet(userId);
    const currentCount = (wallet.items || []).length;
    const currentTotal = wallet.totalSizeBytes || 0;

    if (currentCount >= MAX_ITEMS) {
      return res.status(400).json({
        success: false,
        message: `Wallet is full. Maximum ${MAX_ITEMS} items allowed.`,
      });
    }
    if (currentTotal + sizeBytes > MAX_STORAGE_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'Storage limit exceeded. Maximum 300 MB total.',
      });
    }

    const { encrypted, iv } = encryptBuffer(req.file.buffer);
    const fileKey = `${WALLET_S3_PREFIX}${userId}/${require('crypto').randomUUID()}-${originalName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: encrypted,
        ContentType: 'application/octet-stream',
        Metadata: {
          originalName,
          mimeType: fileType,
          sizeBytes: String(sizeBytes),
          iv,
        },
      })
    );

    wallet.items = wallet.items || [];
    wallet.items.push({
      name: originalName,
      type,
      sizeBytes,
      s3Key: fileKey,
      mimeType: fileType,
      iv,
    });
    wallet.totalSizeBytes = (wallet.totalSizeBytes || 0) + sizeBytes;
    await wallet.save();

    const added = wallet.items[wallet.items.length - 1];
    return res.status(201).json({
      success: true,
      message: 'File uploaded and encrypted.',
      data: {
        id: added._id.toString(),
        name: added.name,
        type: added.type,
        sizeBytes: added.sizeBytes,
        size: (added.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB',
        createdAt: added.createdAt,
      },
    });
  } catch (error) {
    console.error('uploadWalletItem error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload wallet item',
    });
  }
};

exports.deleteWalletItem = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { itemId } = req.params;
    const wallet = await getOrCreateWallet(userId);
    const item = (wallet.items || []).id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wallet item not found',
      });
    }
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: item.s3Key,
        })
      );
    } catch (s3Err) {
      console.warn('S3 delete warning:', s3Err.message);
    }
    wallet.totalSizeBytes = Math.max(0, (wallet.totalSizeBytes || 0) - item.sizeBytes);
    item.remove();
    await wallet.save();
    return res.status(200).json({
      success: true,
      message: 'Item deleted',
    });
  } catch (error) {
    console.error('deleteWalletItem error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete wallet item',
    });
  }
};

exports.getWalletItemDownloadUrl = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { itemId } = req.params;
    const wallet = await getOrCreateWallet(userId);
    const item = (wallet.items || []).id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wallet item not found',
      });
    }
    const expiresIn = Math.min(3600, parseInt(req.query.expiresIn, 10) || 3600);
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucketName, Key: item.s3Key }),
      { expiresIn }
    );
    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        name: item.name,
        mimeType: item.mimeType,
        expiresIn,
      },
    });
  } catch (error) {
    console.error('getWalletItemDownloadUrl error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get download URL',
    });
  }
};

exports.downloadWalletItem = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { itemId } = req.params;
    const wallet = await getOrCreateWallet(userId);
    const item = (wallet.items || []).id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wallet item not found',
      });
    }
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: item.s3Key })
    );
    const encryptedBuffer = await streamToBuffer(response.Body);
    const { decryptBuffer } = require('../../utility/walletEncryption');
    const decrypted = decryptBuffer(encryptedBuffer, String(item.iv));
    res.setHeader('Content-Type', item.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.name)}"`);
    res.setHeader('Content-Length', decrypted.length);
    res.send(decrypted);
  } catch (error) {
    console.error('downloadWalletItem error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to download wallet item',
    });
  }
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

exports.renameWalletItem = async (req, res) => {
  try {
    const userId = req.authData.userId;
    const { itemId } = req.params;
    const { name } = req.body;
    const newName = (name || '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!newName) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }
    const wallet = await getOrCreateWallet(userId);
    const item = (wallet.items || []).id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wallet item not found',
      });
    }
    item.name = newName;
    await wallet.save();
    return res.status(200).json({
      success: true,
      data: {
        id: item._id.toString(),
        name: item.name,
        type: item.type,
        sizeBytes: item.sizeBytes,
        createdAt: item.createdAt,
      },
    });
  } catch (error) {
    console.error('renameWalletItem error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to rename wallet item',
    });
  }
};
