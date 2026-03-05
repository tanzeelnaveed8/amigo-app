const mongoose = require("mongoose");

const userDeviceInfoSchema=new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB', 
  },
  userMoreData:[], // phone,email
  deviceInfo:[
    {
        deviceId:String,
        deviceType:String,   // iOS | Android | Windows
        deviceIP:String,
        date:{
          type:Date,
          default:new Date()
        }
    }
  ]
  
  

}, {timestamps: true})

const userDeviceInfoDB=mongoose.model('userDeviceInfoDB',userDeviceInfoSchema)
module.exports=userDeviceInfoDB