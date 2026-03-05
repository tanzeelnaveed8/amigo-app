const GhostCrowd = require('../../models/ghost/ghostCrowd');

/**
 * Check if a crowd is valid and not expired
 * @param {String} crowdId - The crowd ID to check
 * @returns {Promise<{isValid: Boolean, error?: String, crowd?: Object}>}
 */
const checkCrowdExpiry = async (crowdId) => {
  try {
    if (!crowdId) {
      return { isValid: false, error: 'Crowd ID is required' };
    }

    const crowd = await GhostCrowd.findById(crowdId);

    if (!crowd) {
      return { isValid: false, error: 'Crowd not found' };
    }

    // Check if crowd is marked as inactive
    if (!crowd.isActive) {
      return { isValid: false, error: 'Crowd is no longer active' };
    }

    // Check if crowd has expired
    const now = new Date();
    if (crowd.expiresAt && crowd.expiresAt < now) {
      // Mark as inactive if expired
      await GhostCrowd.findByIdAndUpdate(crowdId, { isActive: false });
      return { isValid: false, error: 'Crowd has expired' };
    }

    return { isValid: true, crowd };
  } catch (error) {
    console.error('Error checking crowd expiry:', error);
    return { isValid: false, error: 'Error validating crowd' };
  }
};

module.exports = {
  checkCrowdExpiry
};





