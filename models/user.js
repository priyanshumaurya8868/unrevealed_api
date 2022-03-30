const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true },
  avatar : {type:String, default:""},
  gender : {type:String,required:true},
  password: { type: String, required: true },
  secrets : [{type:mongoose.Schema.Types.ObjectId,ref:'Secret' }]
});


const User = mongoose.model('User',userSchema)

module.exports = User