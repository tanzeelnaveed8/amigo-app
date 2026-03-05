const userCredentialDB = require("../../models/userAuth/userCredential");
const userDeviceInfoDB = require("../../models/userAuth/userDeviceInfo");
const userInfoDB = require("../../models/userAuth/userInfo");
const {
  ConversationModel,
} = require("../../models/userChat/ConversationModel");
const contactListDB = require("../../models/userChat/userContactList");
const mongoose = require("mongoose");
exports.updateUserProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    bio,
    userName,
    isPhoneVisible,
    isNotificationEnable,
    isDarkMode,
    userAccountType,
    userProfile,
    acountPrivacy,
    isPublic
  } = req.body;

  let data;
  let message;
  let status;
  const userId = req.authData.userId;

  try {
    const user = await userCredentialDB.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "Record not found",
        status: 401,
      });
    }

    // Check if the username is being updated
    if (userName && userName !== user.userName) {
      // Ensure userNameChangeCount field exists
      if (user.userNameChangeCount >= 3) {
        return res.status(400).json({
          message: "You can't update your username more than 3 times",
          status: 400,
        });
      }
      // Increment the username change count
      user.userNameChangeCount = (user.userNameChangeCount || 0) + 1;
    }

    data = await userCredentialDB.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        bio,
        userName,
        isPhoneVisible,
        isNotificationEnable,
        isDarkMode,
        userAccountType,
        userProfile,
        acountPrivacy,
        isPublic,
        userNameChangeCount: user.userNameChangeCount,
      },
      { new: true }
    );

    if (data) {
      //// console.log('record not found');
      status = 201;
      message = "Updated data successfully";
    } else {
      status = 401;
      message = "Record not found";
    }

    res.status(201).json({
      message: message,
      status: status,
      data: data,
    });
  } catch (error) {
    //// console.log({ error });
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

exports.checkUserContactOnAmigo = async (req, res) => {
  const { contact } = req.body;
  // //// console.log({contact});
  let data;
  let contactList;
  let message;
  let status;
  const userId = req.authData.userId;
  // const userId='66910427a5a6bc63019799e9'
  //// console.log({ userId });
  try {
    let existingData = await contactListDB.findOne({ userId: userId });
    if (existingData) {
      message = "Contact List Already Created";
      status = 401;
    } else {
      const datalist = await extractNumber(contact);
      //// console.log({ datalist });
      let contacts = [];
      
      // Helper function to find user by phone with multiple format attempts
      const findUserByPhone = async (phoneNum) => {
        // Try exact match first
        let user = await userCredentialDB.findOne({ phone: phoneNum });
        if (user) return user;
        
        // Try variations with/without leading zero after country code
        // Handle 1-digit country codes (e.g., US: 1)
        if (phoneNum.length > 5 && phoneNum[1] === '0') {
          const withoutZero = phoneNum[0] + phoneNum.substring(2);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 1 && phoneNum[1] !== '0') {
          const withZero = phoneNum[0] + '0' + phoneNum.substring(1);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        // Handle 2-digit country codes (e.g., India: 91, Pakistan: 92)
        if (phoneNum.length > 4 && phoneNum[2] === '0') {
          const withoutZero = phoneNum.substring(0, 2) + phoneNum.substring(3);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 2 && phoneNum[2] !== '0') {
          const withZero = phoneNum.substring(0, 2) + '0' + phoneNum.substring(2);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        // Handle 3-digit country codes (less common)
        if (phoneNum.length > 5 && phoneNum[3] === '0') {
          const withoutZero = phoneNum.substring(0, 3) + phoneNum.substring(4);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 3 && phoneNum[3] !== '0') {
          const withZero = phoneNum.substring(0, 3) + '0' + phoneNum.substring(3);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        return null;
      };
      
      for (let num of datalist) {
        data = await findUserByPhone(num);
        if (data) {
          const userId = data._id;
          contacts.push(userId);
        }
      }
      if (contacts.length > 0) {
        contactList = await contactListDB.create({
          contactNum: contacts,
          userId: userId,
        });
        // //// console.log({ contactList });
        message = "Contact List Created";
        status = 201;
      } else {
        message = "Your Contact List Not Found on Amigo";
        status = 201;
      }
    }

    res.status(201).json({
      message: message,
      status: status,
      data: contactList,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

exports.recheckUserContactOnAmigo = async (req, res) => {
  const { contact } = req.body;
  console.log("contact", contact);
  console.log("contacts received for recheck", JSON.stringify(contact));
  let data;
  let contactList;
  let message;
  let status;
  const userId = req.authData.userId;

  try {
    const datalist = await extractNumber(contact);
    let contacts = [];
    console.log("datalist", datalist);
    
      // Helper function to find user by phone with multiple format attempts
      const findUserByPhone = async (phoneNum) => {
        // Try exact match first
        let user = await userCredentialDB.findOne({ phone: phoneNum });
        if (user) return user;
        
        // Try variations with/without leading zero after country code
        // Handle 1-digit country codes (e.g., US: 1)
        if (phoneNum.length > 5 && phoneNum[1] === '0') {
          const withoutZero = phoneNum[0] + phoneNum.substring(2);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 1 && phoneNum[1] !== '0') {
          const withZero = phoneNum[0] + '0' + phoneNum.substring(1);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        // Handle 2-digit country codes (e.g., India: 91, Pakistan: 92)
        if (phoneNum.length > 4 && phoneNum[2] === '0') {
          const withoutZero = phoneNum.substring(0, 2) + phoneNum.substring(3);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 2 && phoneNum[2] !== '0') {
          const withZero = phoneNum.substring(0, 2) + '0' + phoneNum.substring(2);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        // Handle 3-digit country codes (less common)
        if (phoneNum.length > 5 && phoneNum[3] === '0') {
          const withoutZero = phoneNum.substring(0, 3) + phoneNum.substring(4);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        if (phoneNum.length > 3 && phoneNum[3] !== '0') {
          const withZero = phoneNum.substring(0, 3) + '0' + phoneNum.substring(3);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        return null;
      };
    
    for (let num of datalist) {
      data = await findUserByPhone(num);
      if (data) {
        const userId = data._id;
        contacts.push(userId);
      }
    }
    console.log("contacts", contacts);
    if (contacts.length > 0) {
      let existingData = await contactListDB.findOne({ userId: userId });

      if (existingData) {
        // Update existing contact list by merging with new contacts
        const existingContacts = existingData.contactNum.map((contact) =>
          contact.toString()
        );
        const newContacts = contacts.filter(
          (contact) => !existingContacts.includes(contact.toString())
        );

        if (newContacts.length > 0) {
          // Add new unique contacts to the existing list
          existingData.contactNum.push(...newContacts);
          contactList = await existingData.save();
          message = "Contact List Updated";
          status = 200;
        } else {
          // No new contacts to add, but list is up to date
          contactList = existingData;
          message = "Contact List Up to Date";
          status = 200;
        }
      } else {
        // Create a new contact list
        contactList = await contactListDB.create({
          contactNum: contacts,
          userId: userId,
        });
        message = "Contact List Created";
        status = 201;
      }
    } else {
      message = "Your Contact List Not Found on Amigo";
      status = 404;
    }

    res.status(status).json({
      message: message,
      status: status,
      data: contactList,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

// exports.getUserListofUser = async (req, res) => {
//   const userId = req.authData.userId
//   //// console.log({ userId });
//   let data
//   let contactsList = []
//   let message
//   let status
//   try {
//     const existingConatctList = await contactListDB.aggregate([
//       {$match:{userId: userId}},
//       { $unwind: '$contactNum' },
//       {
//         $lookup: {
//           from: 'usercredentialdbs',
//           localField: 'contactNum',
//           foreignField: '_id',
//           as: 'contactDetails'
//         }
//       },
//       { $unwind: '$contactDetails' },
//       {
//         $project: {
//           _id: 1,
//           userId: 1,
//           contactNum: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           __v: 1,
//           'contactDetails._id': 1,
//           // 'contactDetails.name': 1,
//           'contactDetails.email': 1,
//           'contactDetails.phone': 1,
//           'contactDetails.lastName':1,
//           'contactDetails.firstName':1,
//           'contactDetails.userProfile':1,
//         }
//       },
//       {
//         $group: {
//           _id: '$_id',
//           userId: { $first: '$userId' },
//           contactDetails: { $push: '$contactDetails' },
//           __v: { $first: '$__v' }
//         }
//       }
//     ])
//     //// console.log({existingConatctList});

//     res.status(201).json({
//       message: message || 'test',
//       status: status || 201 ,
//       data: existingConatctList[0]
//     })
//   } catch (error) {
//     res.status(500).json({
//       message: `Failed due to ${error}`
//     })
//   }
// }
exports.getUserListofUser = async (req, res) => {
  const userId = req.authData.userId;

  try {
    // Fetch the contact list with account privacy settings
    const existingContactList = await contactListDB.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$contactNum" },
      {
        $lookup: {
          from: "usercredentialdbs",
          localField: "contactNum",
          foreignField: "_id",
          as: "contactDetails",
        },
      },
      { $unwind: "$contactDetails" },
      {
        $project: {
          _id: "$contactDetails._id",
          phone: "$contactDetails.phone",
          userProfile: "$contactDetails.userProfile",
          firstName: "$contactDetails.firstName",
          lastName: "$contactDetails.lastName",
          userName: "$contactDetails.userName",
          acountPrivacy: "$contactDetails.acountPrivacy",
          isPublic: "$contactDetails.isPublic"
        },
      },
    ]);

    // Fetch blocked users from the conversation collection
    const blockedUsersData = await ConversationModel.findOne({
      $and: [
        {
          $or: [
            {
              participents: {
                $all: [
                  new mongoose.Types.ObjectId(userId),
                  new mongoose.Types.ObjectId(userId),
                ],
              },
            },
          ],
        },
        { conversationType: "dm" },
      ],
    });

    // Get list of users who have saved the requesting user's number
    const usersWhoSavedMe = await contactListDB
      .find({
        contactNum: new mongoose.Types.ObjectId(userId),
      })
      .select("userId");

    const usersWhoSavedMeIds = usersWhoSavedMe.map((contact) =>
      contact.userId.toString()
    );

    // Filter users based on privacy settings and mutual contacts
    const filteredContactList = existingContactList.filter((contact) => {
      if (contact.acountPrivacy === "Public Acount" || contact?.isPublic === true ) {
        return true; // Include all public accounts
      } else {
        // For private accounts, check if there's mutual contact saving
        return usersWhoSavedMeIds.includes(contact._id.toString());
      }
    });

    // Apply block status to filtered list
    let contactsWithBlockStatus = [...filteredContactList];
    if (blockedUsersData) {
      const blockedUserIds = blockedUsersData?.blockUser
        ? [blockedUsersData?.blockUser?.toString()]
        : [];

      for (
        let index = 0;
        index < blockedUsersData.participents.length;
        index++
      ) {
        const findIndex = contactsWithBlockStatus.findIndex(
          (Res) =>
            Res._id?.toString() ===
            blockedUsersData.participents[index]?.toString()
        );

        if (findIndex >= 0) {
          contactsWithBlockStatus[findIndex].blockUser = blockedUserIds;
          contactsWithBlockStatus[findIndex].conversationId = blockedUsersData
            ? blockedUsersData._id?.toString()
            : "";
        }
      }
    }

    res.status(201).json({
      message: "Success",
      status: 201,
      data: {
        _id: userId,
        userId: userId,
        contactDetails: contactsWithBlockStatus,
        __v: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Failed due to ${error}` });
  }
};
exports.getUserListActiveWithChat = async (req, res) => {
  const userId = req.authData.userId;
  let contactsList = [];
  let message;
  let status;

  try {
    const existingContactList = await contactListDB.findOne({ userId: userId });

    if (existingContactList) {
      const contactList = existingContactList.contactNum;

      for (let userid of contactList) {
        let data = await userCredentialDB.aggregate([
          { $match: { _id: userid } },
          {
            $lookup: {
              from: "userinfodbs",
              localField: "_id",
              foreignField: "userId",
              as: "userinfo",
            },
          },
          { $unwind: "$userinfo" },
          {
            $lookup: {
              from: "messages",
              let: { userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$recipient", "$$userId"] },
                        { $eq: ["$seen", false] },
                      ],
                    },
                  },
                },
                { $count: "unseenMessageCount" },
              ],
              as: "unseenmessages",
            },
          },
          {
            $lookup: {
              from: "messages",
              let: { userId: "$_id" },
              pipeline: [
                { $match: { $expr: { $eq: ["$recipient", "$$userId"] } } },
                { $sort: { timestamp: -1 } },
                { $limit: 1 },
              ],
              as: "lastmessage",
            },
          },
          {
            $addFields: {
              unseenMessageCount: {
                $arrayElemAt: ["$unseenmessages.unseenMessageCount", 0],
              },
              lastMessage: { $arrayElemAt: ["$lastmessage", 0] },
            },
          },
          {
            $project: {
              phone: 1,
              isOnline: 1,
              firstName: "$userinfo.firstName",
              lastName: "$userinfo.lastName",
              userProfile: "$userinfo.userProfile",
              unseenMessageCount: { $ifNull: ["$unseenMessageCount", 0] },
              lastMessage: 1,
            },
          },
        ]);

        if (data[0]) {
          contactsList.push(data[0]);
        }
      }
      message = "User List Found";
      status = 200;
    } else {
      message = "User List Not Found";
      status = 404;
    }

    res.status(status).json({
      message: message,
      status: status,
      data: contactsList,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

exports.searchUser = async (req, res) => {
  const searchquery = req.query.searchquery;
  //// console.log({ searchquery });
  let message;
  try {
    const data = await userCredentialDB.find(
      {
        $or: [
          { firstName: { $regex: searchquery, $options: "i" } }, // Case-insensitive matching
          { lastName: { $regex: searchquery, $options: "i" } },
          { userName: { $regex: searchquery, $options: "i" } }, // Case-insensitive matching
          { phone: { $regex: searchquery, $options: "i" } },
          // Case-insensitive matching
        ],
      },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        userProfile: 1,
        phone: 1,
        bio: 1,
        email: 1,
      }
    );
    //// console.log({ data });
    if (data) {
      message = "User Found";
    } else {
      message = "User not found";
    }
    res.status(201).json({
      message: message,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};
exports.searchuserinContact = async (req, res) => {
  const userId = req.authData.userId;
  const searchTerm = req.query.searchTerm;

  try {
    const regex = new RegExp(searchTerm, "i");
    const data = await contactListDB.findOne({ userId }).populate({
      path: "contactNum",
      match: {
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { userName: { $regex: regex } },
          { phone: { $regex: regex } },
        ],
      },
      select: "firstName lastName userName phone userProfile bio",
    });
    res.status(201).json({
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  const userIds = req.query.userId;
  let data;
  let message;
  let status;
  const userId = userIds ? userIds : req.authData.userId;
  // //// console.log({ datatata: userId });

  try {
    data = await userCredentialDB.findById(userId, { otp: 0, token: 0 });
    // //// console.log({ data });
    if (data) {
      message = "User Profile Found";
      status = 201;
    } else {
      message = "User Not Found";
      status = 401;
    }
    res.status(201).json({
      message: message,
      status: status,
      data: data !== null ? data : "",
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

exports.checkUserName = async (req, res) => {
  const { userName } = req.body;

  let message;
  let status;
  try {
    const data = await userCredentialDB.find({
      userName: { $regex: userName, $options: "i" },
    });
    if (data) {
      message = "UserName Already Exist";
      status = 401;
    } else {
      message = "UserName Not Exist";
      status = 201;
    }
    res.status(201).json({
      message: message,
      status: status,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

exports.addUserInContactList = async (req, res) => {
  const { contact } = req.body;
  const userId = req.authData.userId;
  let message;
  let status;
  let contactList;
  try {
    const existingData = await contactListDB.findOne({ userId: userId });
    if (existingData) {
      const datalist = await extractNumber(contact);
      // //// console.log({ datalist });
      let contacts = [];
      
      // Helper function to find user by phone with multiple format attempts
      const findUserByPhone = async (phoneNum) => {
        // Try exact match first
        let user = await userCredentialDB.findOne({ phone: phoneNum });
        if (user) return user;
        
        // Try without leading zero after country code
        if (phoneNum.length > 4 && phoneNum[2] === '0') {
          const withoutZero = phoneNum.substring(0, 2) + phoneNum.substring(3);
          user = await userCredentialDB.findOne({ phone: withoutZero });
          if (user) return user;
        }
        
        // Try with leading zero after country code
        if (phoneNum.length > 2 && phoneNum[2] !== '0') {
          const withZero = phoneNum.substring(0, 2) + '0' + phoneNum.substring(2);
          user = await userCredentialDB.findOne({ phone: withZero });
          if (user) return user;
        }
        
        return null;
      };
      
      for (let num of datalist) {
        const userData = await findUserByPhone(num);
        if (userData) {
          const foundUserId = userData._id;
          contacts.push(foundUserId);
        }
      }
      
      if (contacts.length > 0) {
        // Get existing contacts and add new ones (avoid duplicates)
        const existingContacts = existingData.contactNum.map(c => c.toString());
        const newContacts = contacts.filter(c => !existingContacts.includes(c.toString()));
        
        if (newContacts.length > 0) {
          existingData.contactNum.push(...newContacts);
          contactList = await existingData.save();
          message = "Contact Added Successfully";
          status = 200;
        } else {
          message = "Contact(s) already exist in your contact list";
          status = 200;
          contactList = existingData;
        }
      } else {
        message = "No matching users found for the provided contacts";
        status = 404;
      }
    } else {
      message = "Contact List Not Found. Please create a contact list first.";
      status = 404;
    }
    res.status(status).json({
      message: message,
      status: status,
      data: contactList || null,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed due to ${error}`,
    });
  }
};

const extractNumber = async (data) => {
  // //// console.log({data});
  const phoneNumbers = [];

  try {
    if (!data || !Array.isArray(data)) {
      return phoneNumbers;
    }

    data.forEach((entry) => {
      if (entry?.phoneNumbers?.length > 0) {
        // Get the first phone number (or second if available, but typically use first)
        const phoneNumberObj = entry.phoneNumbers[0] || entry.phoneNumbers[1];
        
        if (phoneNumberObj?.number) {
          let formatedNumber = phoneNumberObj.number;
          
          // Remove all spaces, dashes, parentheses, and plus signs
          formatedNumber = formatedNumber.replace(/[\s\-\(\)\+]/g, '');
          
          // Remove only leading zeros at the very start (not after country code)
          // This handles cases like "0092..." or "092..." but preserves "9230..."
          if (formatedNumber.startsWith('00')) {
            formatedNumber = formatedNumber.substring(2);
          } else if (formatedNumber.startsWith('0') && formatedNumber.length > 1) {
            // Only remove leading zero if it's not part of a valid country code
            // Most country codes are 1-3 digits, so if it starts with 0 and has more than 4 digits,
            // it's likely a number with a leading zero that should be removed
            // But to be safe, we'll keep it for now and let the database matching handle it
          }
          
          // Ensure it's not empty and contains only digits, and has reasonable length (at least 10 digits)
          if (formatedNumber && /^\d+$/.test(formatedNumber) && formatedNumber.length >= 10) {
            phoneNumbers.push(formatedNumber);
          }
        }
      }
    });
  } catch (error) {
    console.log({ errorssss: error });
  }
  console.log({ phoneNumbers });
  return phoneNumbers;
};
