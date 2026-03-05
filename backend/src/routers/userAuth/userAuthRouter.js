const express = require('express');
const router = express.Router();
const {
    sendOtpToPhoneOrEmail,
    sendEmailOtpForRegistration,
    verifyEmailOtpForRegistration,
    verifyOTP,
    createDeviceInfo,
    createUserInfo,
    getAllUser,
    login,
    uploadImages,
    deleteAccount,
    updateUserProfile,
    checkPhoneNumber,
    verifyInviteCode,
    getInviteCode,
    getInviteCodeByUserId,
    getAvailableInviteCode
} = require('../../controllers/userAuth/userAuthcontroller')
const {
    sendFlowSms,
    sendOtp,
    verifyOtp
} = require('../../controllers/userAuth/msg91OtpController')
const { verifyToken, generateToken, generateRefreshToken, verifyRefreshToken } = require('../../middleware/jwtToken');
const userCredentialDB = require('../../models/userAuth/userCredential');
const { s3UploadMiddleware } = require('../../middleware/mediaUpload');
const {  createUserInfoValidation } = require('../../validation/auth.validation');
const validate = require('../../utility/validate/validate.middleware');
router.post('/send-otp', sendOtpToPhoneOrEmail)
router.post('/send-email-otp', sendEmailOtpForRegistration)
router.post('/verify-email-otp', verifyEmailOtpForRegistration)
router.post('/verify-otp',verifyOTP)
router.post('/check-phone', checkPhoneNumber)
router.post('/verify-invite-code', verifyInviteCode)
router.get('/get-available-invite-code', getAvailableInviteCode)
router.get('/get-invite-code', verifyToken, getInviteCode)
router.get('/get-invite-code/:userId', verifyToken, getInviteCodeByUserId)
router.post('/msg91/send-otp', sendOtp)
router.post('/msg91/sms-flow', sendFlowSms)
router.post('/msg91/verify-otp', verifyOtp)
router.post('/msg91/send-flow-sms', sendFlowSms)
router.post('/create-deviceinfo', verifyToken, createDeviceInfo)
router.post('/create-userinfo', s3UploadMiddleware, validate(createUserInfoValidation), createUserInfo)
router.post('/updateUserProfile', verifyToken, s3UploadMiddleware, updateUserProfile)
router.get('/get-all-user', verifyToken, getAllUser)
router.post('/user-login',login)
router.post('/images-upload',verifyToken,s3UploadMiddleware,uploadImages)
router.post('/delete-acoount', deleteAccount)

router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ status: 'error', message: 'Refresh token is required' });
        }
        const decoded = await verifyRefreshToken(refreshToken);
        const user = await userCredentialDB.findById(decoded.user._id);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'User not found' });
        }
        const userPayload = {
            _id: user._id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
        };
        const newToken = generateToken(userPayload);
        const newRefreshToken = generateRefreshToken(userPayload);
        return res.json({
            status: 'success',
            token: newToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'error', message: 'Refresh token expired, please login again', code: 'REFRESH_EXPIRED' });
        }
        return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }
});

module.exports = router
