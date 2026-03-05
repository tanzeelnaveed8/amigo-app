const { s3Client, bucketName, upload } = require('../utility/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const s3UploadMiddleware = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading files', error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      req.uploadedFiles = [];
      return next();
    }
    // console.log("req.files",req.files);
    // console.log({img:req.files});
    const promises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        const params = {
          Bucket: bucketName,
          Key: `uploads/${uniqueFileName}`,
          Body: file.buffer, // Use buffer directly from memory
          ContentType: file.mimetype
        };
        // console.log("params",params);

        const command = new PutObjectCommand(params);
        s3Client.send(command)
          .then((data) => {
            // Attach the S3 URL to the request object for further processing
            file.location = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
            resolve(file);
          })
          .catch((s3Err) => {
            reject(s3Err);
          });
      });
    });

    Promise.all(promises)
      .then((uploadedFiles) => {
        req.uploadedFiles = uploadedFiles;
        next();
      })
      .catch((error) => {
        console.error('Error uploading files to S3:', error);
        res.status(500).json({ message: 'Error uploading files to S3', error: error.message });
      });
  });
};

module.exports = { s3UploadMiddleware };
