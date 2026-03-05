const { messaging } = require("./firebase-admin");

const sendPushNotification = async (params) => {
  try {
    const {
      title = null,
      receiver = null,
      notificationBody,
      displayPicture,
      chatType,
      chatId,
      conversationId,
    } = params;

    const validateFcmToken = (token) => {
      return typeof token === "string" && token.trim() !== "";
    };

    if (!validateFcmToken(receiver?.fcmToken)) {
      console.error(
        "Invalid or empty FCM token for receiver. No notification will be sent."
      );
      return;
    }

    if (!messaging) {
      console.error(
        "Firebase messaging not initialized. No notification will be sent."
      );
      return;
    }

    const notificationPayload = {
      notification: {
        title: title || "Amigo",
        body: notificationBody || "New Message",
      },
      data: {
        displayPicture: displayPicture || "",
        chatType: chatType || "dm",
        chatId: chatId || "",
        conversationId: conversationId || "",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      tokens: [receiver.fcmToken],
    };

    notificationPayload.android = {
      priority: "high",
      notification: {
        channelId: "messages",
        sound: "default",
        priority: "high",
      },
    };
    notificationPayload.apns = {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
          "content-available": 1,
        },
      },
      headers: {
        "apns-priority": "10",
      },
    };

    const receiverResponse = await messaging.sendEachForMulticast(
      notificationPayload
    );

    if (receiverResponse.failureCount > 0) {
      receiverResponse.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(
            `FCM send failed for token index ${idx}:`,
            resp.error?.message
          );
        }
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error?.message || error);
  }
};

module.exports = sendPushNotification;
