const express = require('express');
const { checkFileExists, deleteFile,generateDownloadUrl, generatePresignedUrl, getFileMetadata } =  require('../s3/s3.controller')
const { deleteFileSchema,generatePresignedUrlSchema } =  require('../s3/s3.validation')
const validate = require('../utility/validate/validate.middleware');
const { verifyToken } = require('../middleware/jwtToken');
const router = express.Router();

// All S3 routes require authentication
router.use(verifyToken);
// Generate presigned URL for file upload
router.post('/presigned-url', validate(generatePresignedUrlSchema), generatePresignedUrl);
// Delete file from S3
router.delete('/file', validate(deleteFileSchema), deleteFile);
// Get file metadata
router.get('/metadata/:fileKey', getFileMetadata);
// Generate download URL for file
router.get('/download/:fileKey', generateDownloadUrl);
// Check if file exists
router.get('/exists/:fileKey', checkFileExists);
// Get allowed file types and extensions
// router.get('/allowed-types', getAllowedFileTypes);
module.exports = router;
//# sourceMappingURL=s3.route.js.map