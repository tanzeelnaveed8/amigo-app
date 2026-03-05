const Joi = require('joi');

// Ensure maxFileSize is a number, default to 100MB if not set
const maxFileSize =   100 * 1024 * 1024; // Default to 100MB
 const generatePresignedUrlSchema = Joi.object({
    fileName: Joi.string().required().min(1).max(255).messages({
        'string.empty': 'File name is required',
        'string.min': 'File name must be at least 1 character long',
        'string.max': 'File name cannot be more than 255 characters'
    }),
    // Accept any MIME type to support all audio/video variants (webm/ogg/mpeg with codecs)
    fileType: Joi.string().required().messages({
        'string.empty': 'File type is required'
    }),
    fileSize: Joi.number().required().positive().max(maxFileSize).messages({
        'number.base': 'File size must be a number',
        'number.positive': 'File size must be positive',
        'number.max': `File size cannot exceed ${maxFileSize / 1024 / 1024}MB`
    }),
});
 const deleteFileSchema = Joi.object({
    fileKey: Joi.string().required().min(1).max(1024).messages({
        'string.empty': 'File key is required',
        'string.min': 'File key must be at least 1 character long',
        'string.max': 'File key cannot be more than 1024 characters'
    }),
    bucket: Joi.string().optional().min(1).max(63).messages({
        'string.min': 'Bucket name must be at least 1 character long',
        'string.max': 'Bucket name cannot be more than 63 characters'
    })
});
 const generateDownloadUrlSchema = Joi.object({
    expiresIn: Joi.number().optional().positive().max(86400).messages({
        'number.positive': 'Expiration time must be positive',
        'number.max': 'Expiration time cannot exceed 24 hours (86400 seconds)'
    })
});
 const fileMetadataSchema = Joi.object({
    fileKey: Joi.string().required().min(1).max(1024).messages({
        'string.empty': 'File key is required',
        'string.min': 'File key must be at least 1 character long',
        'string.max': 'File key cannot be more than 1024 characters'
    })
});

module.exports = {
    generatePresignedUrlSchema,
    deleteFileSchema,
    generateDownloadUrlSchema,
    fileMetadataSchema
};
//# sourceMappingURL=s3.validation.js.map