const  mongoose  = require("mongoose");

const secretSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    content : {type:String, required:true},
    tag : {type:String,default:""},
    author:{type : mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    views_count: {type:Number,default:0},
},
 { timestamps: true }
 );

const Secret = mongoose.model('Secret',secretSchema)

module.exports = Secret


function getTime(){
var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
var localISOTime = (new Date(Date.now() - tzoffset)).toISOString()
return localISOTime
}
