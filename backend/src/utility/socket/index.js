const userCredentialDB = require("../../models/userAuth/userCredential");
const {
  ConversationModel,
  MessageModel,
} = require("../../models/userChat/ConversationModel");
const getConversationById = require("../../helper/getConversation");
const contactListDB = require("../../models/userChat/userContactList");
const { default: mongoose } = require("mongoose");
const Message = require("../../models/userChat/userMessage");
const moment = require("moment");
const { Server } = require("socket.io");
const { authMiddleWareSocket } = require("./socket-utils");
const sendPushNotification = require("../sendPushNotification");
const groupDB = require("../../models/group/group");
const chanelDB = require("../../models/chanel/chanel");
const GhostCrowd = require("../../models/ghost/ghostCrowd");
const GhostMember = require("../../models/ghost/ghostMember");
const GhostMessage = require("../../models/ghost/ghostMessage");
const { checkCrowdExpiry } = require("../ghost/expiryChecker");
let io;

/** Returns true only for 24-char hex strings (valid MongoDB ObjectId format) */
const isValidObjectId = (str) => {
  return typeof str === "string" && /^[a-fA-F0-9]{24}$/.test(str);
};

const configureSockets = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" },
      pingInterval: 25000,
      pingTimeout: 20000,
    });
  }
  io.use(authMiddleWareSocket);
  const onlineUsers = new Set();
  const users = {};
  const processedMessages = new Map();

  // Helper function to check if user is online and send FCM notification if offline
  const sendNotificationToOfflineUsers = async (userIds, notificationData, excludeUserId = null) => {
    console.log("sendNotificationToOfflineUsers", userIds, notificationData, excludeUserId);
    try {
      const adapter = io.sockets.adapter;
      const rooms = adapter.rooms;
      
      for (const userId of userIds) {
        // Skip if this is the sender
        if (excludeUserId && userId.toString() === excludeUserId.toString()) {
          continue;
        }

        const userRoomId = userId.toString();
        const isOnline = rooms.has(userRoomId) && rooms.get(userRoomId).size > 0;
        console.log("isOnline", isOnline);
        if (!isOnline) {
          // User is offline, send FCM notification
          try {
            const userData = await userCredentialDB.findById(userId).select("_id fcmToken firstName lastName userName");
        console.log("userData", userData);            
            if (userData && userData.fcmToken) {
              console.log("sendPushNotification", {
                title: notificationData.title || "New Message",
                receiver: userData,
                notificationBody: notificationData.body || "You have a new message",
                displayPicture: notificationData.displayPicture || ""
              });
              await sendPushNotification({
                title: notificationData.title || "New Message",
                receiver: userData,
                notificationBody: notificationData.body || "You have a new message",
                displayPicture: notificationData.displayPicture || ""
              }).catch(err => 
                console.error(`FCM notification error for user ${userId}:`, err)
              );
            }
          } catch (error) {
            console.error(`Error sending FCM notification to user ${userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error in sendNotificationToOfflineUsers:", error);
    }
  };

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

    // let user = null;
    // try {
    //     // //// console.log('user connected', socket);

    //     // const foundRoom = await ChatRooms.findOne({ users: { $all: [receiverId, senderId] }, room_type: type })
    //     // if (!foundRoom) {
    //     //     const createRoom = new ChatRooms({
    //     //         users: [receiverId, senderId],
    //     //         room_type: type,
    //     //         joined_users: [senderId]
    //     //     })
    //     //     await createRoom.save()
    //     //     socket.join(createRoom._id.toString())
    //     //     socket.emit("room_joined", { roomDetails: createRoom, chats: [] })
    //     // }

    //     const token = socket?.handshake?.auth?.token
    //     const tokenn = socket?.handshake?.auth?.id
    //     user = await getUserDetailsFromToken(token)
    //     console.log("user",user);
    //     if (!user?._id) {
    //         socket.emit('unauthorized', { message: 'Invalid or missing token' })
    //         socket.disconnect(true)
    //         return
    //     }
    // } catch (error) {
    //     console.error('Socket connection error:', error)
    //     socket.emit('error', { message: 'Connection failed' })
    //     socket.disconnect(true)
    //     return
    // }
    // socket.on('get_conversation', async (data) => {
    //     try {
    //         const { userId } = data;

    //         //// console.log("userUddddd",userId);

    //         if (!userId) {
    //             socket.emit('error', { message: 'User ID is required' });
    //             return;
    //         }

    //         //// console.log(`Fetching conversations for User ID: ${userId}`);

    //         // Fetch conversation based on userId
    //         const conversations = await getConversationById.getConversation({ currentUserId: userId });

    //         //// console.log("Conversations Retrieved:", conversations);

    //         if (!conversations || conversations.length === 0) {
    //             socket.emit('no_conversations', { message: 'No conversations found' });
    //             return;
    //         }

    //         // Emit the conversations back to the client
    //         socket.emit('conver', conversations);
    //     } catch (error) {
    //         console.error("Error fetching conversation:", error);
    //         socket.emit('error', { message: 'Failed to fetch conversation' });
    //     }
    // });

    // 🏠 Join a group (room)
    // Join Group

    socket.on("joinGroup", ({ groupId }) => {
      console.log('Socket Event: joinGroup', { groupId });
      try {
        socket.join(groupId);
        users[socket.id] = { groupId };
        io.to(groupId).emit("joinMessage", {
          user: "Admin",
          text: "joined the chat",
        });
      } catch (error) {
        console.error("Error in joinGroup:", error);
      }
    });

    // Leave Group
    socket.on("leaveGroup", ({ groupId }) => {
      console.log('Socket Event: leaveGroup', { groupId });
      socket.leave(groupId);
      delete users[socket.id];
      io.to(groupId).emit("leaveMessage", {
        user: "Admin",
        text: "left the chat",
      });
    });

    // Join Channel
    socket.on("joinChanel", ({ groupId }) => {
      console.log('Socket Event: joinChanel', { groupId });
      socket.join(groupId);
      users[socket.id] = { groupId };
      io.to(groupId).emit("joinMessage", {
        user: "Admin",
        text: "joined the chat",
      });
    });

    // Leave Channel
    socket.on("leaveChanel", ({ groupId }) => {
      console.log('Socket Event: leaveChanel', { groupId });
      socket.leave(groupId);
      delete users[socket.id];
      io.to(groupId).emit("leaveMessage", {
        user: "Admin",
        text: "left the chat",
      });
    });

    // Join DM
    socket.on("joinDm", ({ groupId }) => {
      console.log('Socket Event: joinDm', { groupId });
      socket.join(groupId);
      users[socket.id] = { groupId };
      io.to(groupId).emit("joinMessage", {
        user: "Admin",
        text: "joined the chat",
      });
    });

    // Leave DM
    socket.on("leaveDm", ({ groupId }) => {
      console.log('Socket Event: leaveDm', { groupId });
      socket.leave(groupId);
      delete users[socket.id];
      io.to(groupId).emit("leaveMessage", {
        user: "Admin",
        text: "left the chat",
      });
    });

    // For socket usage, you probably want it without any quotes:
    // socket.join(cleanId.toString());

    // socket.join(newUserId);
    // onlineUsers.add(user?._id)

    // io.emit('onlineUser', Array.from(onlineUsers))

    // const onlineUser = async () => {
    //     let arr = []
    //     const result = await contactListDB.findOne({ userId: user?._id?.toString() })
    //     // //// console.log({result});
    //     if (result?.contactNum?.length > 0) {
    //         // //// console.log('console checked');

    //         for (let user of result?.contactNum) {
    //             // //// console.log({ user });
    //             for (let user1 of Array.from(onlineUsers)) {
    //                 // //// console.log({ user1 });
    //                 if (user.toString() === user1) {
    //                     const resguser = await userCredentialDB.findById(user.toString(), { _id: 1, firstName: 1, lastName: 1, userName: 1, userProfile: 1, phone: 1 })
    //                     console.log('matched user', resguser);
    //                     arr.push(resguser)
    //                 }
    //             }

    //         }
    //     }
    //     // //// console.log({ arr });
    //     return arr;
    // }
    // const online_user = await onlineUser()

    // //// console.log({ online_user });
    // io.emit('online-user', online_user)
    // Typing indicators for DM, Group, and Channel
    socket.on("typing", ({ roomId, userId, userName, isTyping }) => {
      if (roomId) {
        socket.to(roomId).emit("typing", { userId, userName, isTyping });
      }
    });

    // Fetch messages with cursor-based pagination
    socket.on("fetch-messages", async ({ conversationId, before, limit = 30 }) => {
      try {
        if (!conversationId) return;
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          socket.emit("fetched-messages", { conversationId, messages: [], hasMore: false });
          return;
        }
        let messageIds = conversation.messages || [];
        if (before) {
          const beforeIndex = messageIds.findIndex(id => id.toString() === before);
          if (beforeIndex > 0) {
            messageIds = messageIds.slice(Math.max(0, beforeIndex - limit), beforeIndex);
          }
        } else {
          messageIds = messageIds.slice(-limit);
        }
        const messages = await MessageModel.find({ _id: { $in: messageIds } })
          .populate({ path: "msgByUserId", model: "userCredentialDB" })
          .sort({ createdAt: 1 });
        const hasMore = before
          ? conversation.messages.findIndex(id => id.toString() === before) > limit
          : conversation.messages.length > limit;
        socket.emit("fetched-messages", { conversationId, messages, hasMore });
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("fetched-messages", { conversationId, messages: [], hasMore: false });
      }
    });

    // Heartbeat: client pings, server pongs
    socket.on("heartbeat", (cb) => {
      if (typeof cb === "function") cb({ status: "alive", ts: Date.now() });
    });

    socket.userId = user?._id?.toString();

    if (socket.userId) {
      // Add user to online users set
      onlineUsers.add(socket.userId);

      // Broadcast updated online users list to all clients
      io.emit("onlineUser", Array.from(onlineUsers));

      // Function to get online contacts for the current user
      const getOnlineContacts = async (userId) => {
        try {
          // Find user's contact list
          const contactList = await contactListDB.findOne({ userId });

          if (!contactList?.contactNum?.length) {
            return [];
          }

          // Get details of online contacts
          const onlineContacts = await userCredentialDB
            .find({
              _id: {
                $in: contactList.contactNum.filter((contactId) =>
                  onlineUsers.has(contactId.toString())
                ),
              },
            })
            .select("_id firstName lastName userName userProfile phone");

          return onlineContacts;
        } catch (error) {
          console.error("Error getting online contacts:", error);
          return [];
        }
      };

      // Send initial online contacts list to the connected user
      const onlineContacts = await getOnlineContacts(socket.userId);
      socket.emit("online-user", onlineContacts);

      // Handle disconnection
      socket.on("Disconnect", () => {
        console.log("disconnecting from");

        if (socket.userId) {
          onlineUsers.delete(socket.userId);
          for (let index = 0; index < Array.from(onlineUsers).length; index++) {
            console.log(
              "Array.from(onlineUsers)[index]",
              Array.from(onlineUsers)[index]
            );
            io.to(Array.from(onlineUsers)[index]).emit(
              "onlineUser",
              Array.from(onlineUsers)
            );
          }
        }
      });
    }
    socket.on("delete-sms", async (data) => {
      console.log('Socket Event: delete-sms', { data });
      // //// console.log({ data });
      try {
        await MessageModel.findByIdAndDelete(data.smsId)
          .then(async (res) => {
            // //// console.log({ res });
            const updateConv = await ConversationModel.findById(
              data.conversationId
            );
            const filterConv = updateConv.messages.filter(
              (item) => item.toString() !== data.smsId
            );
            updateConv.messages = filterConv;
            await updateConv.save();
            io.emit("delete-sms", res);
          })
          .catch((err) => {
            io.emit("error", { message: "Message not found" });
          });
      } catch (error) {
        console.error("Error updating message:", error);
        io.emit("error", {
          message: `Failed to delete conversation: ${error.message}`,
        });
      }
    });

    socket.on("edit-sms", async (data) => {
      console.log('Socket Event: edit-sms', { data });
      // //// console.log({ sms: data });
      try {
        // Find and update the message by ID, returning the updated document
        const updatedsms = await MessageModel.findByIdAndUpdate(
          data.smsId,
          { text: data.text },
          { new: true }
        );
        // //// console.log({ updatedsms });
        // Check if the update was successful
        if (updatedsms) {
          // Emit the updated message to all clients or use broadcast/socket.emit as needed
          io.emit("edit-sms", updatedsms);
        } else {
          // Handle case where the message was not found
          io.emit("error", { message: "Message not found" });
        }
      } catch (error) {
        // Handle any errors that occurred during the database operation
        console.error("Error updating message:", error);
        io.emit("error", {
          message: `Failed to update message: ${error.message}`,
        });
      }
    });

    socket.on("clear-conversation", async (conversationId) => {
      console.log('Socket Event: clear-conversation', { conversationId });
      // //// console.log({ conversationId });
      try {
        const deletedCon = await ConversationModel.findById(conversationId);
        // //// console.log({ deletedCon });
        if (deletedCon) {
          deletedCon.messages = [];
          await deletedCon.save();
          io.emit("clear-conversation", deletedCon);
        } else {
          io.emit("error", { message: "Conversation not found" });
        }
      } catch (error) {
        console.error("Error updating message:", error);
        io.emit("error", {
          message: `Failed to delete conversation: ${error.message}`,
        });
      }
    });

    socket.on("blocked-user", async (data) => {
      console.log('Socket Event: blocked-user', { data });
      try {
        if (!data.conversationId) {
          socket.emit("error", { message: "conversationId is required to block user" });
          return;
        }
        const conversation = await ConversationModel.findById(data.conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }
        conversation.blockUser = [data.userId];
        await conversation.save();
        console.log("blocked-user : socket Event", conversation);
        const participantIds = (conversation.participents || []).map(id => id.toString());
        for (const pid of participantIds) {
          io.to(pid).emit("blocked-user", conversation);
        }
      } catch (err) {
        console.error("Error in blocked-user:", err);
        socket.emit("error", { message: `Failed to block user: ${err.message}` });
      }
    });
    socket.on("unblocked-user", async (data) => {
      console.log('Socket Event: unblocked-user', { data });
      try {
        if (!data.conversationId) {
          socket.emit("error", { message: "conversationId is required to unblock user" });
          return;
        }
        const conversation = await ConversationModel.findById(data.conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }
        conversation.blockUser = conversation.blockUser.filter(
          (id) => id.toString() !== data.userId
        );
        await conversation.save();
        console.log("unblocked-user : socket Event", conversation);
        const participantIds = (conversation.participents || []).map(id => id.toString());
        for (const pid of participantIds) {
          io.to(pid).emit("unblocked-user", conversation);
        }
      } catch (err) {
        console.error("Error in unblocked-user:", err);
        socket.emit("error", { message: `Failed to unblock user: ${err.message}` });
      }
    });

    socket.on("conversation-by-id", async (conversationid) => {
      console.log('Socket Event: conversation-by-id', { conversationid });
      const data = await ConversationModel.findById(conversationid)
        .populate("messages")
        .populate("sender")
        .populate("receiver")
        .populate("groupId");
      // //// console.log({ data });

      socket.emit("conversation-by-id", data);
    });

    // dm start
    socket.on("dm-message-page", async (data) => {
      console.log('Socket Event: dm-message-page', { data });
      // //// console.log({data},'mmmmm')
      const userDetails = await userCredentialDB.findById(data.userId);

      const payload = {
        _id: userDetails?._id,
        phone: userDetails?.phone,
        online: onlineUsers.has(data.userId),
      };
      socket.emit("message-user", payload);
      // Skip DB query if sender/reciever are not valid ObjectIds (e.g. fake/placeholder contacts)
      if (!isValidObjectId(data.sender) || !isValidObjectId(data.reciever)) {
        socket.emit("message", []);
        return;
      }
      //get previous message
      const getConversationMessage = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              {
                participents: {
                  $all: [
                    new mongoose.Types.ObjectId(data.sender),
                    new mongoose.Types.ObjectId(data.reciever),
                  ],
                },
              },
            ],
          },
          { conversationType: "dm" },
        ],
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });
      // //// console.log({ getConversationMessage });
      socket.emit("message", getConversationMessage?.messages || []);
    });
    socket.on("themself-message-page", async (data) => {
      console.log('Socket Event: themself-message-page', { data });
      // //// console.log({data},'mmmmm')
      const userDetails = await userCredentialDB.findById(data.userId);

      const payload = {
        _id: userDetails?._id,
        phone: userDetails?.phone,
        online: onlineUsers.has(data.userId),
      };
      socket.emit("message-user", payload);
      if (!isValidObjectId(data.sender) || !isValidObjectId(data.reciever)) {
        socket.emit("message", []);
        return;
      }
      //get previous message
      const getConversationMessage = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              {
                participents: {
                  $all: [
                    new mongoose.Types.ObjectId(data.sender),
                    new mongoose.Types.ObjectId(data.reciever),
                  ],
                },
              },
            ],
          },
          { conversationType: "themself" },
        ],
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });
      // //// console.log({ getConversationMessage });
      socket.emit("message", getConversationMessage?.messages || []);
    });
    socket.on("group-message-page", async (data) => {
      console.log('Socket Event: group-message-page', { data });
      //// console.log('mmmmm')
      const userDetails = await userCredentialDB.findById(data.userId);

      const payload = {
        _id: userDetails?._id,
        phone: userDetails?.phone,
        online: onlineUsers.has(data.userId),
      };
      socket.emit("message-user", payload);
      //get previous message
      const getConversationMessage = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              {
                _id: new mongoose.Types.ObjectId(data.conversationId),
              },
              {
                groupId: new mongoose.Types.ObjectId(data.groupId),
              },
            ],
          },
          { conversationType: "group" },
        ],
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });
      // //// console.log({ getConversationMessage });
      socket.emit("message", getConversationMessage?.messages || []);
    });
    socket.on("chanel-message-page", async (data) => {
      console.log('Socket Event: chanel-message-page', { data });
      console.log("daata", data);

      //// console.log( data , 'mmmmm')
      const userDetails = await userCredentialDB.findById(data.userId);

      const payload = {
        _id: userDetails?._id,
        phone: userDetails?.phone,
        online: onlineUsers.has(data.userId),
      };
      socket.emit("message-user", payload);
      //get previous message
      const getConversationMessage = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              {
                _id: new mongoose.Types.ObjectId(data.conversationId),
              },
              {
                chanelId: new mongoose.Types.ObjectId(data.chanelId),
              },
            ],
          },
          { conversationType: "chanel" },
        ],
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });
      // //// console.log({ getConversationMessage });
      socket.emit("message", getConversationMessage?.messages || []);
    });
    // dm end

    // Ban/unban user from group (admin action via socket)
    socket.on("ban-group-user", async (data) => {
      console.log('Socket Event: ban-group-user', { data });
      try {
        const { groupId, userId } = data;
        const adminId = user?._id?.toString();
        const group = await groupDB.findById(groupId);
        if (!group) { socket.emit("error", { message: "Group not found" }); return; }
        if (!group.groupAdmin.some(id => id.toString() === adminId)) {
          socket.emit("error", { message: "Only admins can ban users" }); return;
        }
        group.participants = group.participants.filter(id => id.toString() !== userId);
        if (!group.bannedUsers.some(id => id.toString() === userId)) {
          group.bannedUsers.push(userId);
        }
        await group.save();
        const conversation = await ConversationModel.findOne({ groupId, conversationType: 'group' });
        if (conversation) {
          conversation.participents = conversation.participents.filter(id => id.toString() !== userId);
          await conversation.save();
        }
        io.to(groupId).emit("user-banned", { groupId, bannedUserId: userId });
        io.to(userId).emit("you-are-banned", { groupId, type: "group" });
      } catch (err) {
        console.error("Error in ban-group-user:", err);
        socket.emit("error", { message: `Failed to ban user: ${err.message}` });
      }
    });

    socket.on("ban-chanel-user", async (data) => {
      console.log('Socket Event: ban-chanel-user', { data });
      try {
        const { chanelId, userId } = data;
        const adminId = user?._id?.toString();
        const chanel = await chanelDB.findById(chanelId);
        if (!chanel) { socket.emit("error", { message: "Channel not found" }); return; }
        if (!chanel.chanelAdmin.some(id => id.toString() === adminId)) {
          socket.emit("error", { message: "Only admins can ban users" }); return;
        }
        chanel.participants = chanel.participants.filter(id => id.toString() !== userId);
        if (!chanel.bannedUsers.some(id => id.toString() === userId)) {
          chanel.bannedUsers.push(userId);
        }
        await chanel.save();
        const conversation = await ConversationModel.findOne({ chanelId, conversationType: 'chanel' });
        if (conversation) {
          conversation.participents = conversation.participents.filter(id => id.toString() !== userId);
          await conversation.save();
        }
        io.to(chanelId).emit("user-banned", { chanelId, bannedUserId: userId });
        io.to(userId).emit("you-are-banned", { chanelId, type: "chanel" });
      } catch (err) {
        console.error("Error in ban-chanel-user:", err);
        socket.emit("error", { message: `Failed to ban user: ${err.message}` });
      }
    });

    //new message
    socket.on("group-message", async (data) => {
      console.log('Socket Event: group-message', { data });
      // Check if sender is banned
      try {
        const grp = await groupDB.findById(data.groupId);
        if (grp && grp.bannedUsers.some(id => id.toString() === (data.msgByUserId || user?._id?.toString()))) {
          socket.emit("error", { message: "You are banned from this group" });
          return;
        }
      } catch (e) { console.error("Ban check error:", e); }
      const conversationId = data.conversationId;
      //// console.log("group-message123456", data)

      let conversation = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              { _id: new mongoose.Types.ObjectId(conversationId) },
              { groupId: new mongoose.Types.ObjectId(data.groupId) },
            ],
          },
          { conversationType: "group" },
        ],
      });
      // console.log("Conversation1234", conversation);

      if (!conversation) {
        const createConversation = await ConversationModel({
          participents: data.participent,
          groupId: data.groupId,
          conversationType: "group",
          unseenCount: 0,
        });
        conversation = await createConversation.save();
      }
      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        docUrl: data.docUrl,
        msgByUserId: data?.msgByUserId,
        replyMessage: data?.replyMessage,
      });
      const saveMessage = await message.save();
      //// console.log("audiooooo",message.audioUrl);

      const updateConversation = await ConversationModel.updateOne(
        { _id: conversation?._id },
        {
          $push: { messages: saveMessage?._id },
        }
      );

      const getConversationMessage = await ConversationModel.findOne({
        _id: conversation?._id,
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });

      //// console.log('11111', conversation?._id)
      //// console.log("messagess", data?.msgByUserId);
      //// console.log("getConversationMessagegetConversationMessagegetConversationMessage", getConversationMessage);

      io.to(data?.groupId).emit(
        "message",
        getConversationMessage?.messages || []
      );

      for (let index = 0; index < data?.participent?.length; index++) {
        const Covdata = {
          currentUserId: data?.participent?.[index],
        };

        const conversationReceiver = await getConversationById.getConversation(
          Covdata
        );
        io.to(data?.participent?.[index]).emit(
          "conversation",
          conversationReceiver
        );
      }

      try {
        const senderUser = await userCredentialDB.findById(data?.msgByUserId).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        
        await sendNotificationToOfflineUsers(
          data?.participent || [],
          {
            title: `Group: ${senderName}`,
            body: messagePreview,
            displayPicture: ""
          },
          data?.msgByUserId
        );
      } catch (error) {
        console.error("Error sending FCM notification in group-message:", error);
      }
    });
    socket.on("chanel-message", async (data) => {
      console.log('Socket Event: chanel-message', { data });
      // Check if sender is banned
      try {
        const chn = await chanelDB.findById(data.chanelId);
        if (chn && chn.bannedUsers.some(id => id.toString() === (data.sender || user?._id?.toString()))) {
          socket.emit("error", { message: "You are banned from this channel" });
          return;
        }
      } catch (e) { console.error("Ban check error:", e); }

      let conversation = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              { _id: new mongoose.Types.ObjectId(data.conversationId) },
              { chanelId: new mongoose.Types.ObjectId(data.chanelId) },
            ],
          },

          { conversationType: "chanel" },
        ],
      });

      // //// console.log({ conversation }, '1111');

      //if conversation is not available
      if (!conversation) {
        const createConversation = await ConversationModel({
          participents: data.participent,
          chanelId: data.chanelId,
          conversationType: "chanel",
        });
        conversation = await createConversation.save();
      }
      // //// console.log({ conversation }, '2222');
      //// console.log("channel-message1233", data);

      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        docUrl: data.docUrl,
        msgByUserId: data?.sender,
        replyMessage: data?.replyMessage,
      });
      const saveMessage = await message.save();
      // //// console.log({ saveMessage });
      const updateConversation = await ConversationModel.updateOne(
        { _id: conversation?._id },
        {
          $push: { messages: saveMessage?._id },
        }
      );

      const getConversationMessage = await ConversationModel.findOne({
        _id: conversation?._id,
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });

      io.to(data?.chanelId).emit(
        "message",
        getConversationMessage?.messages || []
      );

      for (let index = 0; index < data?.participent?.length; index++) {
        const Covdata = {
          currentUserId: data?.participent?.[index],
        };

        const conversationReceiver = await getConversationById.getConversation(
          Covdata
        );
        io.to(data?.participent?.[index]).emit(
          "conversation",
          conversationReceiver
        );
      }
      //send conversation
      // const conversationSender = await getConversationById.getConversation({ currentUserId: data?.msgByUserId })
      // const conversationReceiver = await getConversationById.getConversation(Covdata)

      // io.to(data?.chanelId).emit('conversation', conversationReceiver)
      // io.to(data?.msgByUserId).emit('conversation', conversationSender)
      
      // Send FCM notification to offline participants
      try {
        const senderUser = await userCredentialDB.findById(data?.sender).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        
        await sendNotificationToOfflineUsers(
          data?.participent || [],
          {
            title: `Channel: ${senderName}`,
            body: messagePreview,
            displayPicture: ""
          },
          data?.sender
        );
      } catch (error) {
        console.error("Error sending FCM notification in chanel-message:", error);
      }
    });
    socket.on("dm-message", async (data) => {
      console.log('Socket Event: dm-message', { data });
      if (!isValidObjectId(data.sender) || !isValidObjectId(data.receiver)) {
        socket.emit("error", { message: "Invalid conversation - cannot send to this contact" });
        return;
      }
      // Check if either user has blocked the other
      try {
        const existingConv = await ConversationModel.findOne({
          participents: { $all: [data.sender, data.receiver] },
          conversationType: "dm"
        });
        if (existingConv && existingConv.blockUser && existingConv.blockUser.length > 0) {
          socket.emit("error", { message: "Cannot send message - user is blocked" });
          return;
        }
      } catch (e) { console.error("Block check error:", e); }
      let conversation = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              {
                participents: {
                  $all: [
                    new mongoose.Types.ObjectId(data.sender),
                    new mongoose.Types.ObjectId(data.receiver),
                  ],
                },
              },
            ],
          },
          { conversationType: "dm" },
        ],
      });
      // //// console.log({ conversation });
      if (!conversation) {
        let participants = [];
        if (data.sender && data.receiver) {
          participants = [data.sender, data.receiver];
        }
        const createConversation = await ConversationModel({
          participents: participants,
        });
        conversation = await createConversation.save();
      }
      // //// console.log({ conversation });

      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        docUrl: data.docUrl,
        msgByUserId: data?.msgByUserId,
        replyMessage: data?.replyMessage,
      });
      const saveMessage = await message.save();
      // //// console.log({ saveMessage });
      const updateConversation = await ConversationModel.updateOne(
        { _id: conversation?._id },
        {
          $push: { messages: saveMessage?._id },
        }
      );

      const getConversationMessage = await ConversationModel.findOne({
        _id: conversation?._id,
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });
      io.to(data?.sender).emit("convId", conversation?._id);
      //// console.log("DMMMMMMM MESSAGEEEE",{ getConversationMessage, sender: data?.sender, receiver: data.receiver });
      io.to(data?.sender).emit(
        "message",
        getConversationMessage?.messages || []
      );
      io.to(data?.receiver).emit(
        "message",
        getConversationMessage?.messages || []
      );

      const conversationSender = await getConversationById.getConversation({
        currentUserId: data?.sender,
      });
      const conversationReceiver = await getConversationById.getConversation({
        currentUserId: data?.receiver,
      });
      // //// console.log({conversationSender});
      io.to(data?.sender).emit("conversation", conversationSender);
      io.to(data?.receiver).emit("conversation", conversationReceiver);
      
      try {
        const senderUser = await userCredentialDB.findById(data?.msgByUserId || data?.sender).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        
        await sendNotificationToOfflineUsers(
          [data.receiver],
          {
            title: senderName,
            body: messagePreview,
            displayPicture: "",
            chatType: "dm",
            chatId: data?.msgByUserId || data?.sender,
            conversationId: conversation?._id?.toString() || "",
          },
          data?.msgByUserId || data?.sender
        );
      } catch (error) {
        console.error("Error sending FCM notification in dm-message:", error);
      }
    });

    //sidebar
    socket.on("sidebar", async (currentUserId) => {
      console.log('Socket Event: sidebar', { currentUserId });
      
      // Validate currentUserId before processing
      if (!currentUserId || typeof currentUserId !== 'string' || currentUserId.trim() === '') {
        console.error('Invalid currentUserId received in sidebar event:', currentUserId);
        socket.emit('error', { message: 'Invalid user ID provided' });
        return;
      }
      
      const data = { currentUserId: currentUserId };
      const conversation = await getConversationById.getConversation(data);
      const user = await userCredentialDB.find({ isDeleted: 1 });
      console.log("user", user);

      if (user?.createdAt !== null) {
        for (let index = 0; index < user?.length; index++) {
          const timeFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";
          const givenTime = moment(user?.[index]?.createdAt, timeFormat);
          const now = moment();
          const diff = now.diff(givenTime, "minutes");
          const withinLastSixMonths = diff <= 2 && diff >= 0;
          console.log("withinLastSixMonths", withinLastSixMonths);

          if (!withinLastSixMonths) {
            try {
              await userCredentialDB.deleteOne({ _id: user?.[index]?._id });

              await ConversationModel.deleteMany({
                userId: user?.[index]?._id,
              }); // Example: Conversations

              console.log(
                `User ${currentUserId} and all related data deleted successfully.`
              );
            } catch (error) {
              console.error("Error deleting user and related data:", error);
            }
          }
        }
      }
      socket.emit("conversation", conversation);
      for (let index = 0; index < user?.length; index++) {
        const Covdata = {
          currentUserId: user?.[index]._id.toString(),
        };
        console.log("Covdata", Covdata);

        const conversationReceiver = await getConversationById.getConversation(
          Covdata
        );
        io.to(user?.[index]._id.toString()).emit(
          "conversation",
          conversationReceiver
        );
      }

      // //// console.log({conversation});
    });

    // socket.on('seen', async (datas) => {
    socket.on("seen", async (datas) => {
      console.log('Socket Event: seen', { datas });
      // console.log("joVAAA");

      try {
        let conversation = await ConversationModel.findById(
          datas.conversationId
        );
        if (!conversation) return; //// console.log("Conversation not found");

        const conversationMessageIds = conversation?.messages || [];

        // Get all messages in the conversation
        const messages = await MessageModel.find({
          _id: { $in: conversationMessageIds },
        });

        for (let msg of messages) {
          let seenUsers = msg.seenByUsers || []; // Ensure it's an array

          if (!seenUsers.includes(datas.userId)) {
            await MessageModel.updateOne(
              { _id: msg._id },
              {
                $set: { seen: true },
                $push: { seenByUsers: datas.userId }, // Add user to seen list
                $inc: { seenByCount: 1 }, // Increase unique view count
              }
            );
          }
        }

        // Fetch updated messages
        const updatedMessages = await MessageModel.find({
          _id: { $in: conversationMessageIds },
        });

        //// console.log("seenvbby", updatedMessages.map(msg => ({ id: msg._id, seenByCount: msg.seenByCount })));

        // Fetch updated conversation
        const getConversationMessage = await ConversationModel.findOne({
          _id: conversation?._id,
        })
          .populate({
            path: "messages",
            populate: {
              path: "msgByUserId",
              model: "userCredentialDB",
            },
          })
          .populate("participents")
          .sort({ updatedAt: -1 });

        io.to(datas.chanelId).emit(
          "message",
          getConversationMessage?.messages || []
        );

        // Send updated conversation
        const conversationSender = await getConversationById.getConversation({
          currentUserId: user?._id?.toString(),
        });
        const conversationReceiver = await getConversationById.getConversation({
          currentUserId: datas.msgByUserId,
        });

        io.to(user?._id?.toString()).emit("conversation", conversationSender);
        io.to(datas.msgByUserId).emit("conversation", conversationReceiver);

        //// console.log("conversationSender seen", JSON.stringify(conversationSender));
        //// console.log("conversationReceiver seen", JSON.stringify(conversationReceiver));
      } catch (error) {
        console.error("Error in seen socket:", error);
      }
    });

    //     let conversation = await ConversationModel.findById(datas.conversationId)
    //     //// console.log("conversationconversation", conversation, conversation)
    //     const conversationMessageId = conversation?.messages || []
    //     const updateMessages = await MessageModel.updateMany(
    //         { _id: { "$in": conversationMessageId } },
    //         { "$set": { seen: true } }
    //     )
    //     const getConversationMessage = await ConversationModel.findOne({
    //         _id: conversation?._id,
    //         seenBy: 1
    //     }).populate({
    //         path: 'messages',
    //         populate: {
    //             path: 'msgByUserId',
    //             model: "userCredentialDB"
    //         }
    //     }).populate('participents').sort({ updatedAt: -1 })

    //     io.to(datas.chanelId).emit('message', getConversationMessage?.messages || [])
    //     //send conversation
    //     const conversationSender = await getConversationById.getConversation({ currentUserId: user?._id?.toString() })
    //     const conversationReceiver = await getConversationById.getConversation({ currentUserId: datas.msgByUserId })

    //     io.to(user?._id?.toString()).emit('conversation', conversationSender)
    //     io.to(datas.msgByUserId).emit('conversation', conversationReceiver)
    //     //// console.log("conversationSenderrrrseen",JSON.stringify(conversationSender));
    //     //// console.log("conversationReceiverrrrseen", JSON.stringify(conversationReceiver));
    // })

    //disconnect
    // socket.on('Disconnect', () => {
    //     onlineUsers.delete(socket.userId);
    //     io.emit('onlineUser', Array.from(onlineUsers)); // Update online users list
    // })
    socket.on("self-message", async (data) => {
      console.log('Socket Event: self-message', { data });
      try {
        let conversation = await ConversationModel.findOne({
          $and: [
            {
              participents: {
                $size: 1,
                $all: [new mongoose.Types.ObjectId(data.sender)],
              },
            },
            { conversationType: "themself" },
          ],
        });

        if (!conversation) {
          const createConversation = new ConversationModel({
            participents: [data.sender],
            conversationType: "themself",
          });
          conversation = await createConversation.save();
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          audioUrl: data.audioUrl,
          docUrl: data.docUrl,
          msgByUserId: data.sender,
          replyMessage: data?.replyMessage,
        });

        const saveMessage = await message.save();
        await ConversationModel.updateOne(
          { _id: conversation?._id },
          { $push: { messages: saveMessage?._id } }
        );

        const getConversationMessage = await ConversationModel.findOne({
          _id: conversation?._id,
        })
          .populate({
            path: "messages",
            populate: {
              path: "msgByUserId",
              model: "userCredentialDB",
            },
          })
          .populate("participents")
          .sort({ updatedAt: -1 });

        io.to(data?.sender).emit(
          "message",
          getConversationMessage?.messages || []
        );

        const conversationSender = await getConversationById.getConversation({
          currentUserId: data?.sender,
        });
        io.to(data?.sender).emit("conversation", conversationSender);

        //// console.log("Self-Chat:", JSON.stringify(conversationSender));
      } catch (error) {
        console.error("Error in self-message socket:", error);
      }
    });
    socket.on("replyMessage", async (data) => {
      console.log('Socket Event: replyMessage', { data });
      // //// console.log(';=data',data)
      // try {
      //     const conversationId = data.conversationId
      //     //// console.log("group-message123456", data)

      //     let conversation = await ConversationModel.findOne({
      //         "$and": [
      //             {
      //                 "$or": [
      //                     { _id: new mongoose.Types.ObjectId(conversationId) },
      //                     { groupId: new mongoose.Types.ObjectId(data.groupId) }
      //                 ]
      //             },
      //             { conversationType: 'group' }
      //         ]

      //     })
      //     //// console.log("Conversation1234", conversation);
      //     const { chatroomId, sender, recipient, text, repliedToMessageId } = data;
      //     //// console.log(`${sender} replied to message ${repliedToMessageId} in room ${chatroomId}: ${text}`);

      //     // Save reply message to the database
      //     const message = new MessageModel({
      //         text: data.text,
      //         imageUrl: data.imageUrl,
      //         videoUrl: data.videoUrl,
      //         audioUrl: data.audioUrl,
      //         docUrl: data.docUrl,
      //         msgByUserId: data?.msgByUserId,
      //         replyMessage: data.replyMessage
      //     })
      //     const saveMessage = await message.save()
      //     const getConversationMessage = await ConversationModel.findOne({
      //         _id: conversation?._id
      //     }).populate({
      //         path: 'messages',
      //         populate: {
      //             path: 'msgByUserId',
      //             model: "userCredentialDB"
      //         }
      //     }).populate('participents').sort({ updatedAt: -1 })
      //     io.to(data?.groupId).emit('message', getConversationMessage?.messages || [])
      //     io.to(data?.groupId).emit('message', getConversationMessage?.messages || [])
      //     // io.to(data?.groupId).emit('replyMessage', saveMessage);

      //     // Emit unseen message count to the recipient
      //     if (recipient !== 'All') {
      //         sendUnseenMessageCount(recipient);
      //     }
      // } catch (error) {
      //     console.error('Error saving reply message:', error);
      // }
      const conversationId = data.conversationId;
      //// console.log("reply-message123456", data)

      let conversation = await ConversationModel.findOne({
        $and: [
          {
            $or: [
              { _id: new mongoose.Types.ObjectId(conversationId) },
              { groupId: new mongoose.Types.ObjectId(data.groupId) },
            ],
          },
          { conversationType: "group" },
        ],
      });
      //// console.log("Conversation1234", conversation);

      if (!conversation) {
        const createConversation = await ConversationModel({
          participents: data.participent,
          groupId: data.groupId,
          conversationType: "group",
        });
        conversation = await createConversation.save();
      }
      const message = new MessageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        docUrl: data.docUrl,
        msgByUserId: data?.msgByUserId,
        replyMessage: data.replyMessage,
      });
      const saveMessage = await message.save();
      //// console.log("audiooooo",message.audioUrl);

      const updateConversation = await ConversationModel.updateOne(
        { _id: conversation?._id },
        {
          $push: { messages: saveMessage?._id },
        }
      );

      const getConversationMessage = await ConversationModel.findOne({
        _id: conversation?._id,
      })
        .populate({
          path: "messages",
          populate: {
            path: "msgByUserId",
            model: "userCredentialDB",
          },
        })
        .populate("participents")
        .sort({ updatedAt: -1 });

      //// console.log('11111', conversation?._id)
      //// console.log("messagess", data?.msgByUserId);
      //// console.log("getConversationMessagegetConversationMessagegetConversationMessage", getConversationMessage);

      io.to(data?.groupId || data.chanelId || data.sender).emit(
        "message",
        getConversationMessage?.messages || []
      );
      //// console.log('22222')

      //send conversation
      const Covdata = {
        conversationId: conversation?._id,
      };
      const conversationSender = await getConversationById.getConversation({
        currentUserId: data?.msgByUserId,
      });
      const conversationReceiver = await getConversationById.getConversation(
        Covdata
      );

      //// console.log("conversationSenderrrrgroup",JSON.stringify(conversationSender));
      //// console.log("conversationReceiverrrrgroup", JSON.stringify(conversationReceiver));

      //// console.log({ conversationSender });
      io.to(data?.groupId || data.chanelId || data.receiver).emit(
        "conversation",
        conversationReceiver
      );
      // io.to(data?.msgByUserId).emit('conversation', conversationSender)

      // Send FCM notification to offline participants
      try {
        const senderUser = await userCredentialDB.findById(data?.msgByUserId).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        const notificationTitle = data.groupId ? `Group: ${senderName}` : data.chanelId ? `Channel: ${senderName}` : senderName;
        
        // Get participants from conversation or data
        const participants = data?.participent || conversation?.participents || [];
        await sendNotificationToOfflineUsers(
          participants,
          {
            title: notificationTitle,
            body: messagePreview,
            displayPicture: ""
          },
          data?.msgByUserId
        );
      } catch (error) {
        console.error("Error sending FCM notification in replyMessage:", error);
      }

      //// console.log('33333');
      // io.to(data?.reciever).emit('conversation', conversationReceiver)
    });
    const sendUnseenMessageCount = async (userId) => {
      console.log('Socket Event: sendUnseenMessageCount', { userId });
        try {
        const unseenCount = await Message.countDocuments({
          recipient: userId,
          seen: false,
        });
        // const socketId = onlineUsers.get(userId);
        // if (socketId) {
        //     io.to(socketId).emit('unseenMessageCount', { unseenCount });
        // }
      } catch (error) {
        console.error("Error fetching unseen messages count:", error);
      }
    };
  });

  // Ghost Crowd Socket Events (No Auth Required)
  // Create a separate namespace for ghost events that doesn't require JWT
  const ghostNamespace = io.of('/ghost');
  
  ghostNamespace.on('connection', async (socket) => {
    console.log(`Ghost socket connected: ${socket.id}`);

    // Join crowd room
    socket.on('joinCrowd', async ({ crowdId, deviceId }) => {
      try {
        if (!crowdId || !deviceId) {
          socket.emit('error', { message: 'crowdId and deviceId are required' });
          return;
        }

        // Check if crowd exists and is valid
        const expiryCheck = await checkCrowdExpiry(crowdId);
        if (!expiryCheck.isValid) {
          socket.emit('error', { message: expiryCheck.error });
          return;
        }

        // Verify member exists
        const member = await GhostMember.findOne({
          crowdId,
          deviceId,
          leftAt: null
        });

        if (!member) {
          socket.emit('error', { message: 'You are not a member of this crowd' });
          return;
        }

        // Join the room
        socket.join(crowdId.toString());
        console.log(`Device ${deviceId} joined ghost crowd ${crowdId}`);
      } catch (error) {
        console.error('Error joining ghost crowd:', error);
        socket.emit('error', { message: 'Error joining crowd' });
      }
    });

    // Leave crowd room
    socket.on('leaveCrowd', ({ crowdId, deviceId }) => {
      try {
        socket.leave(crowdId.toString());
        console.log(`Device ${deviceId} left ghost crowd ${crowdId}`);
      } catch (error) {
        console.error('Error leaving ghost crowd:', error);
      }
    });

    // Send ghost message
    socket.on('sendGhostMessage', async ({ crowdId, deviceId, ghostName, text, media }) => {
      try {
        if (!crowdId || !deviceId || !ghostName || !text) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Check expiry
        const expiryCheck = await checkCrowdExpiry(crowdId);
        if (!expiryCheck.isValid) {
          socket.emit('error', { message: expiryCheck.error });
          return;
        }

        // Verify member exists
        const member = await GhostMember.findOne({
          crowdId,
          deviceId,
          leftAt: null
        });

        if (!member) {
          socket.emit('error', { message: 'You are not a member of this crowd' });
          return;
        }

        // Create message
        const message = await GhostMessage.create({
          crowdId,
          senderDeviceId: deviceId,
          senderGhostName: ghostName,
          text,
          media: media || null
        });

        // Emit to all members in the crowd room
        ghostNamespace.to(crowdId.toString()).emit('ghostMessage', {
          messageId: message._id,
          crowdId: crowdId.toString(),
          senderDeviceId: deviceId, // Include senderDeviceId for identification
          senderGhostName: ghostName,
          text,
          media: message.media || null,
          createdAt: message.createdAt
        });

        console.log(`Ghost message sent in crowd ${crowdId} by ${deviceId}`);
      } catch (error) {
        console.error('Error sending ghost message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Typing indicator - start typing
    socket.on('typingStart', ({ crowdId, deviceId, ghostName }) => {
      try {
        if (!crowdId || !deviceId || !ghostName) {
          return;
        }

        // Emit to all other members in the crowd room (excluding sender)
        socket.to(crowdId.toString()).emit('userTyping', {
          crowdId: crowdId.toString(),
          deviceId,
          ghostName,
          isTyping: true
        });
      } catch (error) {
        console.error('Error handling typing start:', error);
      }
    });

    // Typing indicator - stop typing
    socket.on('typingStop', ({ crowdId, deviceId }) => {
      try {
        if (!crowdId || !deviceId) {
          return;
        }

        // Emit to all other members in the crowd room (excluding sender)
        socket.to(crowdId.toString()).emit('userTyping', {
          crowdId: crowdId.toString(),
          deviceId,
          isTyping: false
        });
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Ghost socket disconnected: ${socket.id}`);
    });
  });

  // Export io instance for use in controllers to emit events
  global.ghostIO = ghostNamespace;

  // Clean up stale processed message IDs every 5 minutes
  setInterval(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, ts] of processedMessages) {
      if (ts < fiveMinAgo) processedMessages.delete(key);
    }
  }, 5 * 60 * 1000);

  return io;
};
module.exports = { configureSockets };



