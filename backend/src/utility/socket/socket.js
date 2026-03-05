const userCredentialDB = require("../../models/userAuth/userCredential");
const {
  ConversationModel,
  MessageModel,
} = require("../../models/userChat/ConversationModel");
const getConversationById = require("../../helper/getConversation");
const 
 = require("../../models/userChat/userContactList");
const { default: mongoose } = require("mongoose");
const Message = require("../../models/userChat/userMessage");
const moment = require("moment");
const { Server } = require("socket.io");
const { authMiddleWareSocket } = require("./socket-utils");
let io;

const configureSockets = (server) => {
  if (!io) {
    io = new Server(server, { cors: { origin: "*" } });
  }
  io.use(authMiddleWareSocket);
  const onlineUsers = new Set();
  const users = {};

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    const user = socket.user;
    console.log("user", user);
    if (!user) {
      console.log("Socket disconnected: No user data");
      socket.disconnect();
      return;
    }
    socket.join(user._id.toString());

    socket.on("userConnected", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("userStatus", { userId, status: "online" });

      // Emit unseen message count to the connected user
      sendUnseenMessageCount(userId);
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      //// console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      //// console.log(`${socket.id} left room ${roomId}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { chatroomId, sender, recipient, text } = data;
        //// console.log(`${sender} sent a message to room ${chatroomId}: ${text}`);

        // Save message to the database
        const newMessage = new Message({
          chatroomId,
          sender,
          recipient: recipient !== "All" ? recipient : undefined,
          text,
          seen: false, // Mark as unseen initially
        });

        await newMessage.save();
        io.to(chatroomId).emit("message", data);

        // Emit unseen message count to the recipient
        if (recipient !== "All") {
          sendUnseenMessageCount(recipient);
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("markMessagesAsSeen", async (data) => {
      try {
        const { userId, chatroomId } = data;
        await Message.updateMany(
          { recipient: userId, chatroomId, seen: false },
          { seen: true }
        );

        // Emit unseen message count to the user
        sendUnseenMessageCount(userId);
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    });

    // New Event: Reply to a message
    socket.on("replyMessage", async (data) => {
      //// console.log(';=data',data)
      try {
        const { chatroomId, sender, recipient, text, repliedToMessageId } =
          data;
        //// console.log(`${sender} replied to message ${repliedToMessageId} in room ${chatroomId}: ${text}`);

        // Save reply message to the database
        const newMessage = new Message({
          chatroomId,
          sender,
          recipient: recipient !== "All" ? recipient : undefined,
          text,
          seen: false,
          repliedTo: repliedToMessageId, // Store the ID of the message being replied to
        });

        await newMessage.save();
        io.to(chatroomId).emit("replyMessage", newMessage);

        // Emit unseen message count to the recipient
        if (recipient !== "All") {
          sendUnseenMessageCount(recipient);
        }
      } catch (error) {
        console.error("Error saving reply message:", error);
      }
    });

    // New Event: Delete a message
    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId, chatroomId } = data;
        //// console.log(`Message ${messageId} in room ${chatroomId} is deleted`);

        // Delete the message from the database
        await Message.findByIdAndUpdate(
          messageId,
          { isDelete: true },
          { new: true }
        );
        io.to(chatroomId).emit("deleteMessage", { messageId });
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("disconnect", () => {
      //// console.log(`${socket.id} disconnected`);
      for (let [userId, id] of onlineUsers) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          io.emit("userStatus", { userId, status: "offline" });
          //// console.log(`${userId} is offline`);

          // Remove unread message count for the user
          unreadMessages.delete(userId);
          break;
        }
      }
    });

    const sendUnseenMessageCount = async (userId) => {
      try {
        const unseenCount = await Message.countDocuments({
          recipient: userId,
          seen: false,
        });
        const socketId = onlineUsers.get(userId);
        if (socketId) {
          io.to(socketId).emit("unseenMessageCount", { unseenCount });
        }
      } catch (error) {
        console.error("Error fetching unseen messages count:", error);
      }
    };
  });

  return io;
};

module.exports = { configureSockets };
