const mongoose = require("mongoose");

const connectMogodb=()=>{
   mongoose.connect(process.env.MONGODB_URI).then((res)=>{
     //// console.log(`mongodb connection done at ${res.connections[0].host}`);
   }).catch((err)=>{
     //// console.log({err});
   })
}

module.exports={connectMogodb}