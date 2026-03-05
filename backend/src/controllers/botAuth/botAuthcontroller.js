const userCredentialDB = require('../../models/userAuth/userCredential')
const userInfoDB = require('../../models/userAuth/userInfo')
const userDeviceInfoDB = require('../../models/userAuth/userDeviceInfo');
const { sendOtp } = require('../../utility/email/otpToEmail');
const { encryption } = require('../../middleware/encryptions/index');
const { generateToken } = require('../../middleware/jwtToken');
const mongoose = require('mongoose');
exports.botAuth = async (req, res) => {
    const { authType, phone } = req.body;
    let data
    let message
    try {
        if (authType === undefined) {
            message = 'Hi I am an Amigo AI assistant, Pleast Allow us to access your phone number from this device for authentications !'
        } else if (authType === 'phone') {
            data = await userCredentialDB.findOne({ phone: phone })
            // //// console.log({ data });
            if (!data) {
                message = 'This Number is not Register with us'
            } else {
                const userId = data._id
                data = await userInfoDB.findOne({
                    $or: [
                        { userId: userId },
                        { userMoreData: { $elemMatch: { phone: phone } } }]
                }, { firstName: 1, lastName: 1, bio: 1, userName: 1, userMoreData: 1 })
                message = 'This number is already registered with use and your info is'
            }
        }

        res.status(201).json({
            message: message,
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}

exports.ceateUserCredentialByBot = async (req, res) => {
    const { phone, deviceInfo } = req.body;
    let data
    let status
    let deviceData
    let message
    let userId
    let acessToken
    try {
        const userData = await userCredentialDB.findOne({ phone: phone })
        // //// console.log({ userData });
        if (userData) {
            
            message = `This Phone Number ${phone} is already registered. Try with different Number`
            status=401
        } else {
            //// console.log('dattatata');
            data = await userCredentialDB.create({ phone: phone })

            userId = data._id
            const user = {
                _id: data._id
            }
            acessToken = generateToken(user)
            if (userId) {
                deviceData = await userDeviceInfoDB.create({
                    userId: userId,
                    deviceInfo: [{
                        deviceId: deviceInfo.deviceId,
                        deviceType: deviceInfo.deviceType,
                        deviceIP: deviceInfo.deviceIP,

                    }],
                    token: acessToken
                })
                // //// console.log({ deviceData });
                message = 'Congratulation Successfully Registered'
                status=201
            }
        }
        res.status(201).json({
            message: message,
            status:status,
            data: acessToken
        })
    } catch (error) {
        // //// console.log(error);
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}

exports.sendOTPWithEmailByBot = async (req, res) => {
    const { email } = req.body;
    const userId = req.authData.userId
    let data
    let message
    let status
    //// console.log(typeof userId);
    try {
        const usercred = await userCredentialDB.findOne({ email: email })
        const userdevice = await userDeviceInfoDB.findOne({ userMoreData: { $elemMatch: { email: email } } })
        const userinfo = await userInfoDB.findOne({ userMoreData: { $elemMatch: { email: email } } })
        if (usercred || userdevice || userinfo) {
            message = `This email is already registered `
            status=401
        } else {
            data = await userCredentialDB.findOne({ _id: userId })
            // //// console.log({ data });
            const updateDeviceData = await userDeviceInfoDB.findOne({ userId: new mongoose.Types.ObjectId(userId) })
            // //// console.log({ updateDeviceData });
            if (data) {
                const otp = await sendOtp(email)
                //// console.log({otp});
                if (otp !== undefined) {
                    // //// console.log({ otp });
                    const hashedOTP = await encryption(otp)
                    // //// console.log({ hashedOTP });
                    data.email = email,
                        data.otp = hashedOTP
                    await data.save()
                    if (updateDeviceData) {
                        updateDeviceData.userMoreData = [{ email: email }]
                        await updateDeviceData.save()
                    }
                    message = `OTP send to email ${email}`
                    status = 201
                } else {
                    message = 'Failed To Genarate OTP'
                    status=401
                }

            }

        }
        res.status(201).json({
            message: message,
            status:status
        })
    } catch (error) {
        //// console.log({ encryption });
        res.status(500).json({
            message: `Failed due to ${error}`
        })
    }
}
