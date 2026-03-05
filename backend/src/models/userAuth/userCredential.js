const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { string } = require("joi");

const userCredentialSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      require: false,
    },
    otp: {
      type: String,
    },
    token: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    bio: {
      type: String,
    },
    userName: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    isPhoneVisible: {
      type: Boolean,
      default: false,
    },
    isNotificationEnable: {
      type: Boolean,
      default: false,
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },

    userProfile: {
      type: String,
      default:
        "https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg",
      require: false,
    },
    userAccountType: {
      type: String,
    },
    acountPrivacy: {
      type: String,
      default: "Public Account",
    },
    isDeleted: {
      type: Number,
      default: 0,
    },
    deviceId: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    fcmToken : {
      type: String,
    },
    // isEmailVerified:{
    //   type:Boolean,
    //   default:false
    // },
    // isPhoneVerified:{
    //   type:Boolean,
    //   default:false
    // },
    userNameChangeCount: { type: Number, default: 0 }, // Track username changes
    // Invite code system fields
    registrationType: {
      type: String,
      enum: ['payment', 'invite'],
      default: 'payment' // Default existing users as payment users
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true // Allow null values but enforce uniqueness when present
    },
    usedInviteCode: {
      type: String, // The invite code used by this user to register
      default: null
    },
    invitesUsed: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    canInvite: {
      type: Boolean,
      default: false // Only true if registered by invite code
    }
  },
  { timestamps: true }
);
userCredentialSchema.index({ phone: 1, email: 1, userName: 1 }, { unique: true });
userCredentialSchema.index({ inviteCode: 1 }, { unique: true, sparse: true });
userCredentialSchema.method("isPasswordMatch", async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
});

userCredentialSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const userCredentialDB = mongoose.model(
  "userCredentialDB",
  userCredentialSchema
);
module.exports = userCredentialDB;
