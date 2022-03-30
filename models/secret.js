const  mongoose  = require("mongoose");

const secretSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    content : {type:String, required:true},
    timestamp: {type:String, default: new Date().toISOString()},
    author:{type : mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    views_count: {type:Number,default:0},
    comments:[{type:mongoose.Schema.Types.ObjectId,ref: 'Comment'}]
});

const Secret = mongoose.model('Secret',secretSchema)

module.exports = Secret


// likes: {
//   type: Map,
//   of: Boolean  
// },
// like_count: {type:Number,default:0},