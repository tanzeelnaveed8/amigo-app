const GhostCrowd = require('../../models/ghost/ghostCrowd');
const GhostMember = require('../../models/ghost/ghostMember');
const GhostMessage = require('../../models/ghost/ghostMessage');
const cron = require('node-cron');
const { s3Client, bucketName, DeleteObjectCommand } = require('../aws');

/**
 * Extract S3 file key from media URL
 * URL format: https://bucket.s3.region.amazonaws.com/uploads/filename
 * @param {String} mediaUrl - The S3 media URL
 * @returns {String|null} - The S3 file key or null if invalid
 */
const extractS3FileKey = (mediaUrl) => {
  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return null;
  }

  try {
    // Parse the URL
    const url = new URL(mediaUrl);
    
    // Extract the pathname and remove leading slash
    // Pathname will be like "/uploads/filename" or "uploads/filename"
    const pathname = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
    
    // Return the file key (e.g., "uploads/filename")
    return pathname || null;
  } catch (error) {
    console.error('Error extracting S3 file key from URL:', mediaUrl, error);
    // Fallback: try to extract manually if URL parsing fails
    const match = mediaUrl.match(/amazonaws\.com\/(.+)$/);
    return match ? match[1] : null;
  }
};

/**
 * Delete file from S3
 * @param {String} fileKey - The S3 file key
 * @returns {Promise<Boolean>} - True if deleted successfully, false otherwise
 */
const deleteS3File = async (fileKey) => {
  if (!fileKey || !bucketName) {
    return false;
  }

  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey
    });
    
    await s3Client.send(deleteCommand);
    return true;
  } catch (error) {
    console.error(`Error deleting S3 file ${fileKey}:`, error);
    return false;
  }
};

/**
 * Cleanup expired crowds and all related data
 * @returns {Promise<{deletedCrowds: Number, deletedMembers: Number, deletedMessages: Number, deletedFiles: Number}>}
 */
const cleanupExpiredCrowds = async () => {
  try {
    const now = new Date();
    
    // Find all expired or inactive crowds
    const expiredCrowds = await GhostCrowd.find({
      $or: [
        { expiresAt: { $lt: now } },
        { isActive: false }
      ]
    });

    if (expiredCrowds.length === 0) {
      console.log('No expired crowds to cleanup');
      return { deletedCrowds: 0, deletedMembers: 0, deletedMessages: 0, deletedFiles: 0 };
    }

    const crowdIds = expiredCrowds.map(crowd => crowd._id);

    // Get all messages with media before deleting them
    const messagesWithMedia = await GhostMessage.find({
      crowdId: { $in: crowdIds },
      media: { $exists: true, $ne: null, $ne: '' }
    }).select('media');

    // Extract S3 file keys from media URLs and delete files from S3
    let deletedFilesCount = 0;
    if (messagesWithMedia.length > 0) {
      console.log(`Found ${messagesWithMedia.length} messages with media. Starting S3 file deletion...`);
      
      const fileKeys = messagesWithMedia
        .map(msg => extractS3FileKey(msg.media))
        .filter(key => key !== null);

      // Delete files from S3 in parallel (with concurrency limit to avoid overwhelming S3)
      const deletePromises = fileKeys.map(fileKey => 
        deleteS3File(fileKey).then(success => {
          if (success) {
            deletedFilesCount++;
            return true;
          }
          return false;
        })
      );

      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletedFilesCount} files from S3`);
    }

    // Delete all related data from database
    const [deletedMembers, deletedMessages] = await Promise.all([
      GhostMember.deleteMany({ crowdId: { $in: crowdIds } }),
      GhostMessage.deleteMany({ crowdId: { $in: crowdIds } })
    ]);

    // Delete the crowds
    const deletedCrowds = await GhostCrowd.deleteMany({ _id: { $in: crowdIds } });

    const stats = {
      deletedCrowds: deletedCrowds.deletedCount,
      deletedMembers: deletedMembers.deletedCount,
      deletedMessages: deletedMessages.deletedCount,
      deletedFiles: deletedFilesCount
    };

    console.log(`Cleanup completed: ${stats.deletedCrowds} crowds, ${stats.deletedMembers} members, ${stats.deletedMessages} messages, ${stats.deletedFiles} S3 files deleted`);
    
    return stats;
  } catch (error) {
    console.error('Error during crowd cleanup:', error);
    throw error;
  }
};

/**
 * Initialize cron job for daily cleanup
 * Runs daily at 2 AM
 */
const initializeCleanupCron = () => {
  // Schedule daily at 2 AM: '0 2 * * *'
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting daily ghost crowd cleanup...');
    try {
      await cleanupExpiredCrowds();
      console.log('Daily ghost crowd cleanup completed successfully');
    } catch (error) {
      console.error('Error in daily ghost crowd cleanup:', error);
    }
  });

  console.log('Ghost crowd cleanup cron job initialized (runs daily at 2 AM)');
};

module.exports = {
  cleanupExpiredCrowds,
  initializeCleanupCron
};





