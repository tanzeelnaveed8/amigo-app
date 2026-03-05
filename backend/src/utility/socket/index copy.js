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
let io;

const configureSockets = (server) => {
  if (!io) {
    io = new Server(server, { cors: { origin: "*" } });
  }
  io.use(authMiddleWareSocket);
  const onlineUsers = new Set();
  const users = {};

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
      // //// console.log({data});
      let blockedUser;
      if (data.conversationId) {
        blockedUser = await ConversationModel.findById(data.conversationId);
        // //// console.log({ blockedUser });
        
        // Add user to blockUser array if not already blocked
        if (blockedUser && !blockedUser.blockUser.includes(data.userId)) {
          blockedUser.blockUser.push(data.userId);
          await blockedUser.save();
        } else if (blockedUser) {
          // User already blocked, just update the array to ensure it's there
          blockedUser.blockUser = [...new Set([...blockedUser.blockUser, data.userId])];
          await blockedUser.save();
        }
        
        io.emit("blocked-user", blockedUser);
      } else {
        io.emit("error", {
          message: `Failed to block user: conversationId is required`,
        });
      }
    });
    socket.on("unblocked-user", async (data) => {
      console.log('Socket Event: unblocked-user', { data });
              //// console.log({ data });
      let blockedUser;
      if (data.conversationId) {
        blockedUser = await ConversationModel.findById(data.conversationId);
        // //// console.log({ blockedUser });
        
        if (blockedUser) {
          // Remove the specific user from blockUser array
          blockedUser.blockUser = blockedUser.blockUser.filter(
            userId => userId?.toString() !== data.userId?.toString()
          );
          await blockedUser.save();
          // //// console.log({ blockedUser });
        }

        io.emit("unblocked-user", blockedUser);
      } else {
        io.emit("error", {
          message: `Failed to unblock user: conversationId is required`,
        });
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

    //new message
    socket.on("group-message", async (data) => {
      console.log('Socket Event: group-message', { data });
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

      // Helper function to check if sender is blocked by a participant
      const isSenderBlockedByParticipant = async (senderId, participantId) => {
        if (senderId?.toString() === participantId?.toString()) {
          return false; // User can't block themselves
        }
        
        const dmConversation = await ConversationModel.findOne({
          $and: [
            {
              participents: {
                $all: [
                  new mongoose.Types.ObjectId(senderId),
                  new mongoose.Types.ObjectId(participantId),
                ],
              },
            },
            { conversationType: "dm" },
          ],
        });
        
        if (dmConversation && dmConversation.blockUser?.length > 0) {
          return dmConversation.blockUser.some(
            blockedUserId => blockedUserId?.toString() === senderId?.toString()
          );
        }
        
        return false;
      };

      // Filter participants who haven't blocked the sender
      const senderId = data?.msgByUserId || data?.sender;
      const participants = data?.participent || [];
      const blockedStatusMap = new Map();
      const unblockedParticipants = [];
      
      // Check blocking status for all participants once
      for (const participantId of participants) {
        const isBlocked = await isSenderBlockedByParticipant(senderId, participantId);
        blockedStatusMap.set(participantId.toString(), isBlocked);
        
        if (!isBlocked) {
          unblockedParticipants.push(participantId);
        } else {
          console.log(`Group message blocked: User ${senderId} is blocked by ${participantId}`);
        }
      }

      //// console.log('11111', conversation?._id)
      //// console.log("messagess", data?.msgByUserId);
      //// console.log("getConversationMessagegetConversationMessagegetConversationMessage", getConversationMessage);

      // Only emit to unblocked participants
      for (const participantId of unblockedParticipants) {
        io.to(participantId).emit(
          "message",
          getConversationMessage?.messages || []
        );
      }

      //send conversation

      for (let index = 0; index < participants.length; index++) {
        const participantId = participants[index];
        const isBlocked = blockedStatusMap.get(participantId.toString());
        
        if (!isBlocked) {
          const Covdata = {
            currentUserId: participantId,
          };

          const conversationReceiver = await getConversationById.getConversation(
            Covdata
          );
          io.to(participantId).emit(
            "conversation",
            conversationReceiver
          );
        }
      }
      const conversationSender = await getConversationById.getConversation({
        currentUserId: data?.msgByUserId,
      });

      //// console.log("conversationSenderrrrgroup",JSON.stringify(conversationSender));
      //// console.log("conversationReceiverrrrgroup", JSON.stringify(conversationReceiver));

      //// console.log({ conversationSender });
      //  io.to(data?.msgByUserId).emit('conversation', conversationSender)

      // Send FCM notification only to unblocked offline participants
      try {
        const senderUser = await userCredentialDB.findById(data?.msgByUserId).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        
        await sendNotificationToOfflineUsers(
          unblockedParticipants,
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

      //// console.log('33333');
      // io.to(data?.reciever).emit('conversation', conversationReceiver)
    });
    socket.on("chanel-message", async (data) => {
      console.log('Socket Event: chanel-message', { data });
        // //// console.log({ participent: data });
      //check conversation is available both user

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

      // Helper function to check if sender is blocked by a participant
      const isSenderBlockedByParticipant = async (senderId, participantId) => {
        if (senderId?.toString() === participantId?.toString()) {
          return false; // User can't block themselves
        }
        
        const dmConversation = await ConversationModel.findOne({
          $and: [
            {
              participents: {
                $all: [
                  new mongoose.Types.ObjectId(senderId),
                  new mongoose.Types.ObjectId(participantId),
                ],
              },
            },
            { conversationType: "dm" },
          ],
        });
        
        if (dmConversation && dmConversation.blockUser?.length > 0) {
          return dmConversation.blockUser.some(
            blockedUserId => blockedUserId?.toString() === senderId?.toString()
          );
        }
        
        return false;
      };

      // Filter participants who haven't blocked the sender
      const senderId = data?.sender || data?.msgByUserId;
      const participants = data?.participent || [];
      const blockedStatusMap = new Map();
      const unblockedParticipants = [];
      
      // Check blocking status for all participants once
      for (const participantId of participants) {
        const isBlocked = await isSenderBlockedByParticipant(senderId, participantId);
        blockedStatusMap.set(participantId.toString(), isBlocked);
        
        if (!isBlocked) {
          unblockedParticipants.push(participantId);
        } else {
          console.log(`Channel message blocked: User ${senderId} is blocked by ${participantId}`);
        }
      }

      // Only emit to unblocked participants
      for (const participantId of unblockedParticipants) {
        io.to(participantId).emit(
          "message",
          getConversationMessage?.messages || []
        );
      }

      for (let index = 0; index < participants.length; index++) {
        const participantId = participants[index];
        const isBlocked = blockedStatusMap.get(participantId.toString());
        
        if (!isBlocked) {
          const Covdata = {
            currentUserId: participantId,
          };

          const conversationReceiver = await getConversationById.getConversation(
            Covdata
          );
          io.to(participantId).emit(
            "conversation",
            conversationReceiver
          );
        }
      }
      //send conversation
      // const conversationSender = await getConversationById.getConversation({ currentUserId: data?.msgByUserId })
      // const conversationReceiver = await getConversationById.getConversation(Covdata)

      // io.to(data?.chanelId).emit('conversation', conversationReceiver)
      // io.to(data?.msgByUserId).emit('conversation', conversationSender)
      
      // Send FCM notification only to unblocked offline participants
      try {
        const senderUser = await userCredentialDB.findById(senderId).select("firstName lastName userName");
        const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
        const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
        
        await sendNotificationToOfflineUsers(
          unblockedParticipants,
          {
            title: `Channel: ${senderName}`,
            body: messagePreview,
            displayPicture: ""
          },
          senderId
        );
      } catch (error) {
        console.error("Error sending FCM notification in chanel-message:", error);
      }
    });
    socket.on("dm-message", async (data) => {
      console.log('Socket Event: dm-message', { data });
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

      // Refresh conversation to get latest blockUser data
      const updatedConversation = await ConversationModel.findById(conversation?._id);
      
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
      
      // Check if sender is blocked by receiver
      const senderId = data?.msgByUserId || data?.sender;
      const receiverId = data?.receiver;
      const isSenderBlocked = updatedConversation?.blockUser?.some(
        blockedUserId => blockedUserId?.toString() === senderId?.toString()
      );
      
      io.to(data?.sender).emit("convId", conversation?._id);
      //// console.log("DMMMMMMM MESSAGEEEE",{ getConversationMessage, sender: data?.sender, receiver: data.receiver });
      
      // Always emit to sender (so they see their own message)
      io.to(data?.sender).emit(
        "message",
        getConversationMessage?.messages || []
      );
      
      // Only emit to receiver if sender is NOT blocked
      if (!isSenderBlocked) {
        io.to(data?.receiver).emit(
          "message",
          getConversationMessage?.messages || []
        );
      } else {
        console.log(`Message blocked: User ${senderId} is blocked by ${receiverId}`);
      }

      const conversationSender = await getConversationById.getConversation({
        currentUserId: data?.sender,
      });
      const conversationReceiver = await getConversationById.getConversation({
        currentUserId: data?.receiver,
      });
      // //// console.log({conversationSender});
      io.to(data?.sender).emit("conversation", conversationSender);
      
      // Only emit conversation update to receiver if sender is NOT blocked
      if (!isSenderBlocked) {
        io.to(data?.receiver).emit("conversation", conversationReceiver);
      }
      
      // Send FCM notification to offline receiver only if sender is NOT blocked
      if (!isSenderBlocked) {
        try {
          const senderUser = await userCredentialDB.findById(senderId).select("firstName lastName userName");
          const senderName = senderUser ? `${senderUser.firstName || ''} ${senderUser.lastName || ''}`.trim() || senderUser.userName : "Someone";
          const messagePreview = data.text || (data.imageUrl ? "📷 Image" : data.videoUrl ? "🎥 Video" : data.audioUrl ? "🎵 Audio" : data.docUrl ? "📄 Document" : "New message");
          
          await sendNotificationToOfflineUsers(
            [data.receiver],
            {
              title: senderName,
              body: messagePreview,
              displayPicture: ""
            },
            senderId
          );
        } catch (error) {
          console.error("Error sending FCM notification in dm-message:", error);
        }
      }
      
      //// console.log("conversationSenderrrrdm",JSON.stringify(conversationSender));
      //// console.log("conversationReceiverrrrdm", JSON.stringify(conversationReceiver));
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

  return io;
};
module.exports = { configureSockets };



