const AppError = require('../utility/appError.js');
const S3Service = require('./s3.service.js');
/**
 * Generate presigned URL for file upload
 */
 const generatePresignedUrl = async (req, res) => {
    try {
        console.log('=========> Generate presigned URL request:', req.body);
        const body = req.body;
        const fileName = String(body.fileName || '');
        const fileType = String(body.fileType || '');
        const fileSize = Number(body.fileSize || 0);
        // Validate required fields
        if (!fileName || !fileType || !fileSize) {
            console.log('=========> return 400');
            return res.status(400).json({
                success: false,
                message: 'fileName, fileType, and fileSize are required'
            });
        }
        // Normalize fileType by stripping codec parameters if present
        const normalizedType = fileType.split(';')[0] || fileType;
        const safeFileName = String(fileName);
        const safeFileSize = Number(fileSize);
        console.log('=========> safeFileSize:', safeFileSize);
        const presignedUrlResponse = await S3Service.generatePresignedUrl({
            fileName: safeFileName,
            fileType: normalizedType,
            fileSize: safeFileSize,
        });
        console.log('=========> presignedUrlResponse:', presignedUrlResponse);
        return res.status(200).json({
            success: true,
            message: 'Presigned URL generated successfully',
            data: presignedUrlResponse
        });
    }
    catch (error) {
        console.error('Generate presigned URL error:', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to generate presigned URL',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
/**
 * Delete file from S3
 */
 const deleteFile = async (req, res) => {
    try {
        const { fileKey, bucket } = req.body;
        console.log('=========> Delete file request:', { fileKey, bucket, body: req.body });
        if (!fileKey) {
            return res.status(400).json({
                success: false,
                message: 'fileKey is required'
            });
        }
        const result = await S3Service.deleteFile(fileKey, bucket);
        return res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            data: { deleted: result }
        });
    }
    catch (error) {
        console.error('Delete file error:', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
/**
 * Get file metadata
 */
 const getFileMetadata = async (req, res) => {
    try {
        const { fileKey, bucket } = req.params;
        if (!fileKey) {
            return res.status(400).json({
                success: false,
                message: 'fileKey is required'
            });
        }
        const metadata = await S3Service.getFileMetadata(fileKey, bucket);
        if (!metadata) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'File metadata retrieved successfully',
            data: metadata
        });
    }
    catch (error) {
        console.error('Get file metadata error:', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to get file metadata',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
/**
 * Generate download URL for file
 */
 const generateDownloadUrl = async (req, res) => {
    try {
        const { fileKey, bucket } = req.params;
        const { expiresIn } = req.query;
        if (!fileKey) {
            return res.status(400).json({
                success: false,
                message: 'fileKey is required'
            });
        }
        const downloadUrl = await S3Service.generateDownloadUrl(fileKey, bucket, expiresIn ? parseInt(expiresIn) : 3600);
        return res.status(200).json({
            success: true,
            message: 'Download URL generated successfully',
            data: {
                downloadUrl,
                expiresIn: expiresIn ? parseInt(expiresIn) : 3600
            }
        });
    }
    catch (error) {
        console.error('Generate download URL error:', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to generate download URL',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};
/**
 * Check if file exists
 */
 const checkFileExists = async (req, res) => {
    try {
        const { fileKey, bucket } = req.params;
        if (!fileKey) {
            return res.status(400).json({
                success: false,
                message: 'fileKey is required'
            });
        }
        const exists = await S3Service.fileExists(fileKey, bucket);
        return res.status(200).json({
            success: true,
            message: 'File existence checked successfully',
            data: { exists }
        });
    }
    catch (error) {
        console.error('Check file exists error:', error);
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to check file existence',
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    generatePresignedUrl,
    deleteFile,
    getFileMetadata,
    generateDownloadUrl,
    checkFileExists
};