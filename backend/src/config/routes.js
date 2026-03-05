const {
  userAuthRouter,
  botAuthRouter,
  userProfileRouter,
  userChatRouter,
  groupRouter,
  mediaRouter,
  chanelRouter,
  s3Router,
  ghostCrowdRouter,
  walletRouter,
  qrJoinRouter,
  razorPayRouter,
} = require("../routers");

const otherRoutes = require("./otherRoutes");

module.exports = (app) => {
  app.use("/api/user-auth", userAuthRouter);
  app.use("/api/bot-auth", botAuthRouter);
  app.use("/api/user", userProfileRouter);
  app.use("/api/chat", userChatRouter);
  app.use("/api/group", groupRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/chanel", chanelRouter);
  app.use("/api/s3", s3Router);
  app.use("/api/ghost-crowd", ghostCrowdRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/qr", qrJoinRouter);
  app.use("/api/razorpay", razorPayRouter);

  otherRoutes(app);
};
