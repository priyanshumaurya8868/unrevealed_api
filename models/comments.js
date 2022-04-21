const  mongoose  = require("mongoose");
const commentSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    content : {type:String, required:true},
    secret_id: {type:mongoose.Schema.Types.ObjectId,ref: 'Secret'},
    parent_comment_id: {type:mongoose.Schema.Types.ObjectId,ref: 'Comment'},
    commenter:{type : mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    liked_by : [{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
},
{ timestamps: true }
);
  

const Comment = mongoose.model('Comment',commentSchema)

module.exports = Comment

function getTime(){
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString()
    return localISOTime
    }


// The "multi" makes sure that the "comnt" would be removed for all User objects that reference it, thought it probably really is only one document anyway.


//existenceOfFieldInDocument : https://www.geeksforgeeks.org/mongodb-check-the-existence-of-the-fields-in-the-specified-collection/#:~:text=In%20MongoDB%2C%20we%20can%20check,of%20that%20field%20is%20null).

// existenceOfItemInAFieldArray : https://stackoverflow.com/questions/37202585/check-if-value-exists-in-array-field-in-mongodb


// hooks- del used ref : https://stackoverflow.com/questions/68987607/remove-referenced-documents-with-mongoose-mongodb-middleware-in-2021


