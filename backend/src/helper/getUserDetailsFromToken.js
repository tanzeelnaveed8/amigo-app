const jwt = require('jsonwebtoken')
const userCredentialDB = require('../models/userAuth/userCredential')

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return null
    }
    try {
        const decoded = jwt.verify(token, process.env.jwtsecretKey)
        const userId = decoded?.user?._id
        if (!userId) {
            return null
        }
        const user = await userCredentialDB.findById(userId)
        return user || null
    } catch (err) {
        return null
    }
}

module.exports = getUserDetailsFromToken