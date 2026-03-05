const { makeid } = require('./makeId');
const userCredentialDB = require('../models/userAuth/userCredential');

/**
 * Generate a unique invite code for a user
 * @returns {Promise<string>} Unique invite code
 */
const generateUniqueInviteCode = async () => {
  let inviteCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 8-character alphanumeric code (uppercase only for better UX)
    inviteCode = makeid(8).toUpperCase();
    
    // Check if code already exists
    const existingUser = await userCredentialDB.findOne({ inviteCode });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique invite code after multiple attempts');
  }

  return inviteCode;
};

module.exports = { generateUniqueInviteCode };
