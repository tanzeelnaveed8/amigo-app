const jwt = require("jsonwebtoken");
const userCredentialDB = require("../../models/userAuth/userCredential");
const { default: mongoose } = require("mongoose");

module.exports = {
  authMiddleWareSocket: async (socket, next) => {
    try {
      const token =
        socket.handshake.headers?.authorization ||
        socket.handshake.headers["token"] ||
        socket.handshake.headers["auth"] ||
        socket.handshake.auth["token"];

      if (!token) return next(new Error("Authentication token missing"));

      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.jwtsecretKey, (err, decodedToken) => {
          if (err || !decodedToken || typeof decodedToken !== "object") {
            return reject(err || new Error("Invalid token payload"));
          }
          resolve(decodedToken);
        });
      });
      console.log('decoded',decoded);
      const user = await userCredentialDB.findById(
        new mongoose.Types.ObjectId(decoded?.user?._id)
      );
      console.log('user',user);
      if (!user) return next(new Error("User not found"));

      socket.user = {
        _id: user._id,
        name: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        userAccountType: user.userAccountType,
        userProfile: user.userProfile,
      };

      next();
    } catch (err) {
      next(new Error("Invalid token: " + err.message));
    }
  },
};
