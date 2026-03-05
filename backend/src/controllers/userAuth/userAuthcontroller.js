const userCredentialDB = require('../../models/userAuth/userCredential')
const { sendOtp } = require('../../utility/email/otpToEmail')
const { sendOtpSms } = require('./msg91OtpController')
const { encryption, decrypt } = require('../../middleware/encryptions/index')
const userDeviceInfoDB = require('../../models/userAuth/userDeviceInfo')
const userInfoDB = require('../../models/userAuth/userInfo')
const { generateToken, generateRefreshToken } = require('../../middleware/jwtToken')
const mediaDB = require('../../models/media/media')
const { default: mongoose } = require('mongoose')
const {firebaseAdmin} = require('../../utility/firebase-admin')
const OTP = require('../../models/userAuth/otp')
const AppError = require('../../utility/appError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendPushNotification = require('../../utility/sendPushNotification') // <--- added
const { generateUniqueInviteCode } = require('../../utility/inviteCode')

const UNLIMITED_INVITE_PHONES = new Set(['919971645229', '918076254682']);
const normalizePhone = (p) => String(p || '').trim().replace(/^\+/, '');

exports.sendOtpToPhoneOrEmail = async (req, res) => {
    const { phone, flowType = 'register' } = req.body;

    try {
        const hasPhone = typeof phone === 'string' && phone.trim() !== '' && phone !== 'undefined' && phone !== 'null';

        if (!hasPhone) {
            return res.status(400).json({
                status: 400,
                message: 'Phone number is required'
            });
        }

        const validFlowTypes = ['register', 'login'];
        if (!validFlowTypes.includes(flowType)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid flowType. Must be "register" or "login"'
            });
        }

        // Validate and resolve user by phone only
        const existingUser = await userCredentialDB.findOne({ phone: phone.trim(), isDeleted: 0 });

        if (flowType === 'login') {
            if (!existingUser) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found with this phone number. Please register first.'
                });
            }
        } else {
            if (existingUser) {
                return res.status(409).json({
                    status: 409,
                    message: 'User already exists with this phone number. Please login instead.'
                });
            }
        }

        const userId = flowType === 'login' && existingUser ? existingUser._id : null;
        await sendOtpSms(phone.trim(), flowType, userId);

        res.status(200).json({
            status: 200,
            message: `OTP sent to ${phone.trim()} successfully`,
            data: {
                phone: phone.trim(),
                flowType
            }
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            status,
            message: error.message || `Failed due to ${error}`
        });
        console.log('sendOtpToPhoneOrEmail error:', error);
    }
};

// Email OTP flow (registration only)
exports.sendEmailOtpForRegistration = async (req, res) => {
    const { email } = req.body;

    try {
        const cleanEmail = typeof email === 'string' && email.trim() !== '' && email !== 'undefined' && email !== 'null'
            ? email.trim()
            : null;

        if (!cleanEmail) {
            return res.status(400).json({ status: 400, message: 'Email is required' });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ status: 400, message: 'Please provide a valid email address' });
        }

        // Registration-only: email must not already exist
        const existingEmail = await userCredentialDB.findOne({ email: cleanEmail, isDeleted: 0 });
        if (existingEmail) {
            return res.status(409).json({ status: 409, message: 'Email already registered. Please use a different email or login.' });
        }

        const code = await sendOtp(cleanEmail);
        await OTP.create({
            email: cleanEmail,
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            flowType: 'register'
        });

        return res.status(200).json({
            status: 200,
            message: `Registration OTP sent to ${cleanEmail} successfully`,
            data: { email: cleanEmail }
        });
    } catch (error) {
        console.error('sendEmailOtpForRegistration error:', error);
        return res.status(500).json({ status: 500, message: `Failed due to ${error}` });
    }
};

exports.verifyEmailOtpForRegistration = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const cleanEmail = typeof email === 'string' && email.trim() !== '' && email !== 'undefined' && email !== 'null'
            ? email.trim()
            : null;
        const cleanOtp = typeof otp === 'string' && otp.trim() !== '' && otp !== 'undefined' && otp !== 'null'
            ? otp.trim()
            : null;

        if (!cleanEmail) {
            return res.status(400).json({ status: 400, message: 'Email is required' });
        }
        if (!cleanOtp) {
            return res.status(400).json({ status: 400, message: 'OTP is required' });
        }

        const otpRecord = await OTP.findOne({ email: cleanEmail, code: cleanOtp, flowType: 'register' });
        if (!otpRecord) {
            return res.status(401).json({ status: 401, message: 'Invalid or expired OTP' });
        }
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(401).json({ status: 401, message: 'OTP expired' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        // token proving email verification for registration
        const emailOtpToken = generateToken({ _id: null, email: cleanEmail });

        return res.status(200).json({
            status: 200,
            message: 'Email OTP verified successfully',
            data: {
                email: cleanEmail,
                emailOtpToken
            }
        });
    } catch (error) {
        console.error('verifyEmailOtpForRegistration error:', error);
        return res.status(500).json({ status: 500, message: `Failed due to ${error}` });
    }
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp, flowType } = req.body;
    let responseData = null;
    let message;
    let status;

    try {
        const hasPhone = typeof phone === 'string' && phone.trim() !== '' && phone !== 'undefined' && phone !== 'null';
        const hasOtp = typeof otp === 'string' && otp.trim() !== '' && otp !== 'undefined' && otp !== 'null';

        if (!hasPhone) {
            return res.status(400).json({ status: 400, message: 'Phone number is required' });
        }
        if (!hasOtp) {
            return res.status(400).json({ status: 400, message: 'OTP is required' });
        }

        const validFlowTypes = ['register', 'login'];
        const resolvedFlowType = flowType || 'register';
        if (!validFlowTypes.includes(resolvedFlowType)) {
            return res.status(400).json({ status: 400, message: 'Invalid flowType. Must be "register" or "login"' });
        }

        const isLoginFlow = resolvedFlowType === 'login';
        const existingUser = await userCredentialDB.findOne({ phone: phone.trim(), isDeleted: 0 });

        // OTP lookup by phone and code only (no email)
        const otpRecord = await OTP.findOne({ phone: phone.trim(), code: otp.trim(), flowType: resolvedFlowType });
        if (!otpRecord) {
            return res.status(401).json({ status: 401, message: 'Invalid or expired OTP' });
        }
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(401).json({ status: 401, message: 'OTP expired' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        if (isLoginFlow) {
            if (!existingUser) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found with this phone number. Please register first.'
                });
            }

            const user = { _id: existingUser._id };
            const accessToken = generateToken(user);
            existingUser.token = accessToken;
            await existingUser.save();

            responseData = existingUser;
            status = 200;
            message = 'Login OTP verified successfully';
        } else {
            if (existingUser) {
                return res.status(409).json({
                    status: 409,
                    message: 'User already exists with this phone number. Please login instead.'
                });
            }

            responseData = null;
            status = 201;
            message = 'Otp verification successful for registration';
        }

        res.status(status).json({
            status,
            message,
            token: responseData ? responseData.token : '',
            data: responseData
        });
    } catch (error) {
        console.log({ error });
        res.status(500).json({
            status: 500,
            message: `Failed due to ${error}`
        });
    }
};

exports.checkPhoneNumber = async (req, res) => {
    const { phone } = req.body;
    let message;
    let status;
    
    try {
        // Validate required fields
        const hasPhone = typeof phone === 'string' && phone.trim() !== '' && phone !== 'undefined' && phone !== 'null';

        if (!hasPhone) {
            return res.status(400).json({
                status: 400,
                message: 'Phone number is required',
                exists: false
            });
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^[1-9]\d{9,14}$/;
        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid phone number format. Please include country code (e.g., 923039971549)',
                exists: false
            });
        }

        // Check if user exists by phone number
        const existingUser = await userCredentialDB.findOne({ 
            phone: phone.trim(), 
            isDeleted: 0 
        });
        
        if (existingUser) {
            message = 'User exists with this phone number';
            status = 200;
            return res.status(200).json({
                status: status,
                message: message,
                exists: true,
                data: {
                    phone: phone.trim(),
                    userId: existingUser._id,
                    email: existingUser.email || null
                }
            });
        } else {
            message = 'User does not exist with this phone number';
            status = 200;
            return res.status(200).json({
                status: status,
                message: message,
                exists: false,
                data: {
                    phone: phone.trim()
                }
            });
        }
    } catch (error) {
        console.error("Error checking phone number:", error);
        res.status(500).json({
            status: 500,
            message: `Failed to check phone number: ${error.message}`,
            exists: false
        });
    }
};

exports.verifyInviteCode = async (req, res) => {
    const { inviteCode } = req.body;
    
    try {
        // Validate required fields
        if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.trim() === '') {
            return res.status(400).json({
                status: 400,
                message: 'Invite code is required',
                valid: false
            });
        }

        // Find user with this invite code
        const inviterUser = await userCredentialDB.findOne({ 
            inviteCode: inviteCode.trim().toUpperCase(),
            isDeleted: 0 
        });

        if (!inviterUser) {
            return res.status(404).json({
                status: 404,
                message: 'Invalid invite code',
                valid: false
            });
        }

        const isUnlimitedInviter = UNLIMITED_INVITE_PHONES.has(normalizePhone(inviterUser.phone));

        // Check if inviter can still invite (hasn't reached limit of 3)
        if (!isUnlimitedInviter && (inviterUser.invitesUsed || 0) >= 3) {
            return res.status(403).json({
                status: 403,
                message: 'This invite code has reached its maximum usage limit (3 users)',
                valid: false
            });
        }

        // Check if inviter is allowed to invite (must have registered by invite code)
        if (!inviterUser.canInvite || inviterUser.registrationType !== 'invite') {
            return res.status(403).json({
                status: 403,
                message: 'This user cannot invite others. Only users who registered with an invite code can invite others.',
                valid: false
            });
        }

        // Invite code is valid
        return res.status(200).json({
            status: 200,
            message: 'Invite code is valid',
            valid: true,
            data: {
                inviteCode: inviteCode.trim().toUpperCase(),
                inviterName: inviterUser.firstName || inviterUser.userName || 'User',
                invitesRemaining: isUnlimitedInviter ? 999999 : 3 - (inviterUser.invitesUsed || 0)
            }
        });

    } catch (error) {
        console.error("Error verifying invite code:", error);
        res.status(500).json({
            status: 500,
            message: `Failed to verify invite code: ${error.message}`,
            valid: false
        });
    }
};

exports.getInviteCode = async (req, res) => {
    const userId = req.authData.userId;
    
    try {
        // Find user
        const user = await userCredentialDB.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        // Check if user can invite
        if (!user.canInvite || user.registrationType !== 'invite') {
            return res.status(403).json({
                status: 403,
                message: 'You cannot invite users. Only users who registered with an invite code can invite others.',
                canInvite: false
            });
        }

        const isUnlimitedInviter = UNLIMITED_INVITE_PHONES.has(normalizePhone(user.phone));

        // Check if user has reached invite limit
        if (!isUnlimitedInviter && (user.invitesUsed || 0) >= 3) {
            return res.status(403).json({
                status: 403,
                message: 'You have reached the maximum number of invites (3)',
                canInvite: false,
                invitesUsed: user.invitesUsed,
                invitesRemaining: 0
            });
        }

        // Generate invite code if user doesn't have one
        if (!user.inviteCode) {
            user.inviteCode = await generateUniqueInviteCode();
            await user.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Invite code retrieved successfully',
            canInvite: true,
            data: {
                inviteCode: user.inviteCode,
                invitesUsed: user.invitesUsed || 0,
                invitesRemaining: isUnlimitedInviter ? 999999 : 3 - (user.invitesUsed || 0)
            }
        });

    } catch (error) {
        console.error("Error getting invite code:", error);
        res.status(500).json({
            status: 500,
            message: `Failed to get invite code: ${error.message}`
        });
    }
};

exports.getAvailableInviteCode = async (req, res) => {
    try {
        const user = await userCredentialDB.findOne().select('inviteCode');

        if (!user) {
            return res.status(404).json({ status: 404, message: 'No user found in database' });
        }

        if (!user.inviteCode) {
            user.inviteCode = await generateUniqueInviteCode();
            await user.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Invite code fetched successfully',
            data: { inviteCode: user.inviteCode }
        });

    } catch (error) {
        console.error("Error fetching available invite code:", error);
        res.status(500).json({ status: 500, message: `Failed: ${error.message}` });
    }
};

exports.getInviteCodeByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({
                status: 400,
                message: 'userId is required'
            });
        }

        const user = await userCredentialDB.findById(userId).select('inviteCode invitesUsed canInvite registrationType phone');

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        const isUnlimitedInviter = UNLIMITED_INVITE_PHONES.has(normalizePhone(user.phone));

        // Generate invite code if user doesn't have one
        if (!user.inviteCode) {
            user.inviteCode = await generateUniqueInviteCode();
            await user.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Invite code fetched successfully',
            data: {
                userId: user._id,
                inviteCode: user.inviteCode,
                invitesUsed: user.invitesUsed || 0,
                invitesRemaining: isUnlimitedInviter ? 999999 : Math.max(0, 3 - (user.invitesUsed || 0)),
                canInvite: user.canInvite,
                registrationType: user.registrationType
            }
        });

    } catch (error) {
        console.error("Error fetching invite code by userId:", error);
        res.status(500).json({
            status: 500,
            message: `Failed to fetch invite code: ${error.message}`
        });
    }
};

exports.createDeviceInfo = async (req, res) => {
    const { phone, email, deviceIP, deviceType, deviceId } = req.body;
    const userId = req.authData.userId
    // //// console.log({userId});
    let data
    let message
    try {
        data = await userDeviceInfoDB.findOne({
            $or: [{ userId: userId },
            { userMoreData: { $elemMatch: { phone: phone } } },
            { userMoreData: { $elemMatch: { email: email } } }]
        })
        // //// console.log({data});
        if (!data) {
            data = await userDeviceInfoDB.create({
                userId: userId,
                userMoreData: phone !== undefined || email !== undefined ? [{ phone: phone, email: email }] : [],
                deviceInfo: [{
                    deviceId: deviceId,
                    deviceType: deviceType,
                    deviceIP: deviceIP,

                }]

            })
            message = "New user device info created successfully";

        } else {
            //// console.log('data');
            const existsDeviceId = data.deviceInfo.find((item) => item.deviceId === deviceId)

            if (existsDeviceId === undefined) {
                data.deviceInfo.push({
                    deviceId: deviceId,
                    deviceType: deviceType,
                    deviceIP: deviceIP
                });
            }

            const existsEmail = data.userMoreData.find((item) => item.email === email)
            const existsPhone = data.userMoreData.find((item) => item.phone === phone)

            if (existsEmail === undefined) {
                data.userMoreData.push({
                    email: email
                })
            }
            if (existsPhone === undefined) {
                data.userMoreData.push({
                    phone: phone
                })
            }
            await data.save(); // Save the updated document
            message = "User device info updated successfully";
        }
        res.status(201).json({
            message: message,
            data: data
        })
    } catch (error) {
        //// console.log({ error });
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
exports.createUserInfo = async (req, res) => {
    const { phone, email, firstName, lastName, userName, otpToken, emailOtpToken, fcmToken, inviteCode } = req.body;
    const uploadedFilesPaths = req?.uploadedFiles?.map(file => file?.location);
    if(!otpToken){
        return res.status(400).json({
            message: 'OTP token is required',
            status: 400
        });
    }
    // Debug logging to see what values are coming through
    console.log('Received data:', req.body);

    let data;
    let message;
    let status;
    let inviterUser = null;

    try {
        // Validate OTP token if phone number is provided
        const cleanPhone = phone && phone !== 'undefined' && phone !== '' && phone !== 'null' ? phone.trim() : undefined;
        const cleanEmail = email && email !== 'undefined' && email !== '' && email !== 'null' ? email.trim() : undefined;
        const cleanInviteCode = inviteCode && inviteCode !== 'undefined' && inviteCode !== '' && inviteCode !== 'null' ? inviteCode.trim().toUpperCase() : null;

        // Validate Email OTP token (registration email verification)
        if (cleanEmail) {
            const token = emailOtpToken;
            if (!token || typeof token !== 'string' || token.trim() === '' || token === 'undefined' || token === 'null') {
                return res.status(401).json({
                    status: 401,
                    message: 'Email OTP verification token is required. Please verify your email first.'
                });
            }

            try {
                const decoded = jwt.verify(token.trim(), process.env.jwtsecretKey);
                if (!decoded.user || !decoded.user.email) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid token. Token does not contain email verification.'
                    });
                }

                if (decoded.user.email !== cleanEmail) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Email mismatch. The token does not match the email provided.'
                    });
                }
            } catch (tokenError) {
                console.error('Email token verification error:', tokenError);
                return res.status(401).json({
                    status: 401,
                    message: 'Invalid or expired email verification token. Please verify your email again.'
                });
            }
        }
        // If email is NOT provided, emailOtpToken is ignored (optional).

        // Handle invite code validation if provided
        if (cleanInviteCode) {
            // Find user with this invite code
            inviterUser = await userCredentialDB.findOne({ 
                inviteCode: cleanInviteCode,
                isDeleted: 0 
            });

            if (!inviterUser) {
                return res.status(404).json({
                    status: 404,
                    message: 'Invalid invite code'
                });
            }

            const isUnlimitedInviter = UNLIMITED_INVITE_PHONES.has(normalizePhone(inviterUser.phone));

            // Check if inviter can still invite (hasn't reached limit of 3)
            if (!isUnlimitedInviter && (inviterUser.invitesUsed || 0) >= 3) {
                return res.status(403).json({
                    status: 403,
                    message: 'This invite code has reached its maximum usage limit (3 users)'
                });
            }

            // Check if inviter is allowed to invite (must have registered by invite code)
            if (!inviterUser.canInvite || inviterUser.registrationType !== 'invite') {
                return res.status(403).json({
                    status: 403,
                    message: 'This user cannot invite others. Only users who registered with an invite code can invite others.'
                });
            }
        }

        // If phone is provided, validate OTP token
        if (cleanPhone) {
            // Get token from Authorization header or request body
            // const bearerHeader = req.headers['authorization'];
            let token = otpToken;
            
            // if (bearerHeader) {
            //     const parts = bearerHeader.split(' ');
            //     if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            //         token = parts[1];
            //     }
            // }
            
            // // Fallback to otpToken from body if not in header
            // if (!token) {
            //     token = otpToken;
            // }

            // Validate token exists and is a string
            if (!token || typeof token !== 'string' || token.trim() === '' || 
                token === 'undefined' || token === 'null') {
                return res.status(401).json({
                    status: 401,
                    message: 'OTP verification token is required. Please verify your phone number first.'
                });
            }

            // Validate token format (JWT should have 3 parts separated by dots)
            // const tokenParts = token.trim().split('.');
            // if (tokenParts.length !== 3) {
            //     console.error('Invalid token format - expected JWT with 3 parts, got:', tokenParts.length);
            //     return res.status(401).json({
            //         status: 401,
            //         message: 'Invalid token format. Please verify your phone number again.'
            //     });
            // }

            try {
                // Verify token
                const decoded = jwt.verify(token.trim(), process.env.jwtsecretKey);
                
                // Check if token contains phone number
                if (!decoded.user || !decoded.user.phone) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Invalid token. Token does not contain phone verification.'
                    });
                }

                // Validate that phone number in token matches phone number in request
                if (decoded.user.phone !== cleanPhone) {
                    return res.status(401).json({
                        status: 401,
                        message: 'Phone number mismatch. The token does not match the phone number provided.'
                    });
                }

                // Check if user already exists (prevent duplicate registration)
                const existingUser = await userCredentialDB.findOne({ 
                    phone: cleanPhone, 
                    isDeleted: 0 
                });
                
                if (existingUser) {
                    return res.status(409).json({
                        status: 409,
                        message: 'User already exists with this phone number. Please login instead.'
                    });
                }
            } catch (tokenError) {
                console.error('Token verification error:', tokenError);
                return res.status(401).json({
                    status: 401,
                    message: 'Invalid or expired OTP verification token. Please verify your phone number again.'
                });
            }
        }

        // Check for duplicate username, email, and phone
        const existingUser = await userCredentialDB.findOne({ 
            userName: userName.trim(), 
            isDeleted: 0 
        });
        
        if (existingUser && existingUser._id.toString() !== req.body.userId) {
            return res.status(409).json({
                message: 'Username already exists',
                status: 409,
                errors: ['This username is already taken. Please choose a different one.']
            });
        }

        // Check for duplicate email (if provided)
        if (cleanEmail) {
            const existingEmail = await userCredentialDB.findOne({ 
                email: cleanEmail, 
                isDeleted: 0 
            });
            
            if (existingEmail && existingEmail._id.toString() !== req.body.userId) {
                return res.status(409).json({
                    message: 'Email already exists',
                    status: 409,
                    errors: ['This email is already registered. Please use a different email.']
                });
            }
        }

        // Phone number duplicate check is already done in token validation above

        // Determine registration type
        const registrationType = cleanInviteCode ? 'invite' : 'payment';
        
        // Generate invite code for new user if they registered by invite
        let newUserInviteCode = null;
        if (cleanInviteCode) {
            newUserInviteCode = await generateUniqueInviteCode();
        }

        // Use findOneAndUpdate with upsert to create or update user
        data = await userCredentialDB.findOneAndUpdate(
            { userName: userName, isDeleted: 0 },
            { 
                phone: cleanPhone, 
                ...(cleanEmail ? { email: cleanEmail } : {}),
                firstName: firstName.trim(), 
                lastName: lastName.trim(), 
                userName: userName.trim(),
                fcmToken: fcmToken ? fcmToken.trim() : undefined, 
                isVerified: true,
                userProfile: uploadedFilesPaths?.[0] || 'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg',
                // Invite code system fields
                registrationType: registrationType,
                ...(newUserInviteCode ? { inviteCode: newUserInviteCode } : {}),
                ...(cleanInviteCode ? { usedInviteCode: cleanInviteCode } : {}),
                canInvite: cleanInviteCode ? true : false
            },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        // Send welcome push notification after successful signup (fire-and-forget)
        sendPushNotification({
          title: 'Welcome to Amigo',
          receiver: data,
          notificationBody: 'Your account has been created successfully. Start connecting with friends!',
          displayPicture: data.userProfile || ''
        }).catch(err => console.error('sendPushNotification signup error:', err));

        // Check if it was created or updated by checking if the document was just created
        const isNewUser = data.createdAt && data.updatedAt && 
                         (new Date(data.createdAt).getTime() === new Date(data.updatedAt).getTime());

        // Update inviter's invitesUsed count if invite code was used (only for new users)
        if (cleanInviteCode && inviterUser && isNewUser) {
            const isUnlimitedInviter = UNLIMITED_INVITE_PHONES.has(normalizePhone(inviterUser.phone));
            if (!isUnlimitedInviter) {
                inviterUser.invitesUsed = (inviterUser.invitesUsed || 0) + 1;
                await inviterUser.save();
            }
        }

        // Generate token for the user
        const user = { _id: data._id };
        const token = generateToken(user);
        
        // Save token to user document
        data.token = token;
        if (fcmToken) {
            data.fcmToken = fcmToken.trim();
        }
        await data.save();

        if (isNewUser) {
            message = "User created successfully";
            status = 201;
        } else {
            message = "User info updated successfully";
            status = 200;
        }

        res.status(status).json({
            message: message,
            status: status,
            token: token,
            data: data
        });

    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        });
    }
};
exports.updateUserProfile = async (req, res) => {
    try {
        console.log("Request Body:", req.body);  // Debugging logs
        console.log("Uploaded Files:", req.files);

        const { userId } = req.body;
        const uploadedFilesPaths = req?.uploadedFiles?.map(file => file?.location) || [];

        if (!userId) {
            return res.status(400).json({ message: "userId is required", status: 400 });
        }

        // Check if the user exists
        const user = await userCredentialDB.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", status: 404 });
        }

        // Ensure an image file is uploaded
        if (uploadedFilesPaths.length === 0) {
            return res.status(400).json({ message: "No image uploaded", status: 400 });
        }

        // Update the user profile image
        const updatedUser = await userCredentialDB.findByIdAndUpdate(
            userId,
            { userProfile: uploadedFilesPaths[0] },
            { new: true }
        );

        return res.status(200).json({ message: "User profile updated successfully", status: 200, data: updatedUser });

    } catch (error) {
        return res.status(500).json({ message: `Failed due to ${error.message}`, status: 500 });
    }
};

exports.login = async (req, res) => {
    const { userName, password , fcmToken} = req.body; 

    try {
        const data = await userCredentialDB.findOne({ userName: userName }).select('+password');
             console.log(data,'data')
        if (!data || !(await data.isPasswordMatch(password))) {
            // throw new AppError('Incorrect email or password',401, { email: 'Incorrect email or password' });
             return res.status(401).json({
                    message: 'Incorrect email or password',
                    status: 401
                });
         }
   
            // Check if user is deleted
            if (data.isDeleted === 1) {
                return res.status(201).json({
                    message: 'Account is deleted, Please contact administrator for account activation',
                    status: 401
                });
            }
            
              if(!data.isVerified){
                 return res.status(401).json({
                    message: 'Please contact administrator for account activation',
                    status: 401
                });
              }         
          
              if (!data?.email) {
                return res.status(401).json({
                    message: 'Email is required',
                    status: 401
                });
              }
            const token = generateToken({
                _id: data._id.toString()
            });
            data.token = token;
            if(fcmToken){
                data.fcmToken = fcmToken
            }
            await data.save();         
            const responseData = data && typeof data.toObject === 'function' ? data.toObject() : data;
            if (responseData && responseData.password) {
                delete responseData.password;
            }

        // Send OTP to user's email after successful login
        let otpMessage = '';
        
            try {
                const otp = await sendOtp(data.email);
                await OTP.create({ 
                    phone: data.phone,
                    email: data.email,
                    code: otp, 
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
                    flowType: 'login',
                    userId: data._id
                });
                otpMessage = `Login OTP sent to ${data.email}`;
                console.log('Login OTP sent to:', data.email);
            } catch (otpError) {
                console.error('Failed to send login OTP:', otpError);
                otpMessage = 'Login successful, but failed to send OTP to email';
            }
        
   // Send push notification on successful login (fire-and-forget)
            sendPushNotification({
              title: 'Login Successful',
              receiver: data,
              notificationBody: 'You have successfully logged in to Amigo.',
              displayPicture:  ''
            }).catch(err => console.error('sendPushNotification login error:', err));
            
        const refreshToken = generateRefreshToken({ _id: data._id.toString() });

        res.status(200).json({
            message: otpMessage || 'User Login Successfully',
            status: 200,
            token: token !== undefined && token !== null ? token : '',
            refreshToken: refreshToken,
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        });
    }
}

exports.login2 = async (req, res) => {
    const { userName, password } = req.body; 

    try {
        const data = await userCredentialDB.findOne({ userName: userName }).select('+password');
    console.log(data,'data')
        if (!data || !(await data.isPasswordMatch(password))) {
            throw new AppError('Incorrect email or password',401, { email: 'Incorrect email or password' });
         }
   
            // Check if user is deleted
            if (data.isDeleted === 1) {
                return res.status(201).json({
                    message: 'Account is deleted, Please contact administrator for account activation',
                    status: 401
                });
            }
            
              if(!data.isVerified){
                throw new AppError('Please contact administrator for account activation',401, { email: 'Please contact administrator for account activation' });
              }         
          
           
            const token = generateToken({
                _id: data._id.toString()
            });
            data.token = token;
            await data.save();         
        const responseData = data && typeof data.toObject === 'function' ? data.toObject() : data;
        if (responseData && responseData.password) {
            delete responseData.password;
        }
        res.status(201).json({
            message: 'User Login Successfully',
            status: 201,
            token: token !== undefined && token !== null ? token : '',
            data: responseData
        });
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        });
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const data = await userCredentialDB.find()
        res.status(201).json({
            message: 'User Got',
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
exports.uploadImages = async (req, res) => {
    const { mediaType } = req.body;
    const conversationId = req.body?.conversationId || null; // Allow conversationId to be optional
    const uploadedFilesPaths = req?.uploadedFiles?.map(file => file.location);
    const userId = req.authData.userId;

    try {
        const data = await mediaDB.create({
            conversationId,  // Now conversationId can be null
            sender: userId,
            mediaurl: uploadedFilesPaths[0],
            mediaType
        });

        res.status(201).json({
            status: 201,
            message: 'Media Uploaded',
            data: data
        });
    } catch (error) {
        //// console.log({ error });
        res.status(500).json({
            error: error.message
        });
    }
};
exports.deleteAccount = async (req, res) => {
    try {
        const { userId, isDeleted } = req.body;

        console.log("deleteAccount", req.body);

        if (!userId) {
            return res.status(400).json({ status: false, message: "User ID is required" });
        }

        // Update the isDeleted flag
        const updateUser = await userCredentialDB.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(userId) },
            { isDeleted: isDeleted },
            { new: true }
        );

        if (!updateUser) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        return res.status(200).json({
            status: true,
            message: "Account deleted successfully",
            data: updateUser
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}
