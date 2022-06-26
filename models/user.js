const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true},
  avatar : {type:String, default:""},
  gender : {type:String,required:true},
  password: { type: String, required: true },
  d_token : {type:String,default:""}
});


const User = mongoose.model('User',userSchema)

module.exports = User