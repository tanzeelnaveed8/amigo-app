const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const AppError = require('../utility/appError.js');
const httpStatus = require('http-status');
const { s3Client } = require('../utility/aws.js');
const { uuidv4 } = require('uuid');


 class S3Service {
    s3Client;
    config;
    constructor() {
        this.config = {
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_S3_BUCKET,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        };
      
       
        this.s3Client = s3Client
    }
    /**
     * Generate a presigned URL for file upload
     */
    async generatePresignedUrl(request) {
        try {
            const { fileName, fileType, fileSize } = request;
            // Validate file extension and MIME type
            // const validation = validateFile(fileName, fileType);
            // if (!validation.isValid) {
            //   throw new AppError(
            //     httpStatus.BAD_REQUEST,
            //     validation.error || 'File type not allowed'
            //   );
            // }
            // Validate file size
            const maxFileSize = config.aws.maxFileSize;
            if (fileSize > maxFileSize) {
                throw new AppError(httpStatus.BAD_REQUEST, `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`);
            }
            // Generate unique file key
            const fileKey = `${uuidv4()}-${fileName}`;
            const targetBucket = config.aws.s3.bucket;
            // Create the command for putting object
            const putObjectCommand = new PutObjectCommand({
                Bucket: targetBucket,
                Key: fileKey,
                ContentType: fileType,
                Metadata: {
                    originalName: fileName,
                    uploadedAt: new Date().toISOString()
                }
            });
            // Generate presigned URL (expires in 15 minutes)
            const uploadUrl = await getSignedUrl(this.s3Client, putObjectCommand, {
                expiresIn: 900 // 15 minutes
            });
            // Construct file URL (public or private presigned URL for GET)
            const fileUrl = `https://${targetBucket}.s3.${config.aws.region}.amazonaws.com/${fileKey}`;
            return {
                uploadUrl,
                fileKey,
                bucket: targetBucket,
                expiresIn: 900,
                fileUrl
            };
        }
        catch (error) {
            console.error('Error generating presigned URL:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate presigned URL');
        }
    }
    /**
     * Delete a file from S3
     */
    async deleteFile(fileKey, bucket) {
        try {
            const targetBucket = bucket || this.config.bucket;
            console.log('=========> Deleting file from S3:', { fileKey, targetBucket, configBucket: this.config.bucket });
            const deleteCommand = new DeleteObjectCommand({
                Bucket: targetBucket,
                Key: fileKey
            });
            await this.s3Client.send(deleteCommand);
            console.log('=========> File deleted successfully from S3');
            return true;
        }
        catch (error) {
            console.error('Error deleting file from S3:', error);
            // Log more details about the error
            if (error && typeof error === 'object' && 'Code' in error) {
                console.error('S3 Error Code:', error.Code);
                // console.error('S3 Error Message:', (error as any).Message);
                // console.error('S3 Request ID:', (error as any).RequestId);
            }
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete file from S3');
        }
    }
    /**
     * Get file metadata from S3
     */
    async getFileMetadata(fileKey, bucket) {
        try {
            const targetBucket = bucket || this.config.bucket;
            const getObjectCommand = new GetObjectCommand({
                Bucket: targetBucket,
                Key: fileKey
            });
            const response = await this.s3Client.send(getObjectCommand);
            if (!response.Metadata) {
                return null;
            }
            return {
                originalName: response.Metadata['originalName'] || fileKey,
                fileKey,
                fileType: response.ContentType || 'application/octet-stream',
                fileSize: response.ContentLength || 0,
                bucket: targetBucket,
                uploadedAt: new Date(response.Metadata['uploadedAt'] || Date.now()),
                uploadedBy: response.Metadata['uploadedBy'] || 'unknown'
            };
        }
        catch (error) {
            console.error('Error getting file metadata from S3:', error);
            return null;
        }
    }
    /**
     * Generate a presigned URL for file download/viewing
     */
    async generateDownloadUrl(fileKey, bucket, expiresIn = 3600) {
        try {
            const targetBucket = bucket || this.config.bucket;
            const getObjectCommand = new GetObjectCommand({
                Bucket: targetBucket,
                Key: fileKey
            });
            const downloadUrl = await getSignedUrl(this.s3Client, getObjectCommand, {
                expiresIn
            });
            return downloadUrl;
        }
        catch (error) {
            console.error('Error generating download URL:', error);
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate download URL');
        }
    }
    /**
     * Check if file exists in S3
     */
    async fileExists(fileKey, bucket) {
        try {
            const targetBucket = bucket || this.config.bucket;
            const headCommand = new GetObjectCommand({
                Bucket: targetBucket,
                Key: fileKey
            });
            await this.s3Client.send(headCommand);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
module.exports = new S3Service();
//# sourceMappingURL=s3.service.js.map