require('dotenv').config();
const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
  ListPartsCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const multer = require('multer');
console.log('=========> S3 Service Config:', {
  region: process.env.AWS_REGION ,
  bucket: process.env.AWS_BUCKET_NAME_APP ,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_KEY_ID
});
const s3Client = new S3Client({
  region: process.env.AWS_REGION ,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID
  }
});
const bucketName = process.env.AWS_BUCKET_NAME_APP;

const snsClient = new SNSClient({
  region: process.env.AWS_REGION ,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY_ID
  }
});
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    fieldSize: 50 * 1024 * 1024, // 50MB limit for non-file fields
  }
});

module.exports = { 
  s3Client,
  snsClient,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
  ListPartsCommand,
  DeleteObjectCommand,
  PublishCommand,
  upload,
  bucketName
};
// getSignedUrl,
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
