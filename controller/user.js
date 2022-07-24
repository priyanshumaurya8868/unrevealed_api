const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const check_auth = require("../middleware/check-auth");


exports.get_user= (req,res,next)=>{
const user_id = req.user_data._id
User.findById(user_id).select(["username", "_id","gender","secrets","avatar", "d_token"])
.exec()
.then(
  (result) => {
  if (result) 
  res.status(200).json(result);
  else 
  next(ApiError.resourceNotFound("User not found!"));
}
)
.catch((err) => next(err));
}

exports.get_user_by_id = (req, res, next) => {
    const user_id = req.params.user_id;
    User.findById(user_id).select(["username", "_id","gender","secrets","avatar"])
      .exec()
      .then(
        (result) => {
        if (result) 
        res.status(200).json(result);
        else 
        next(ApiError.resourceNotFound("User not found!"));
      }
      )
      .catch((err) => next(err));
  }

  
exports.recieveDeviceToken = (req,res,next)=>{
console.log("reached")
  const userId   = req.user_data._id
  const d_token = req.query.d_token;

  User.findOneAndUpdate({_id: userId},{$set : {d_token : d_token}})
  .exec()
  .then((result)=>{
    if(result)
   { res.status(200).json({
      status : "Success",
      msg : "Device token registered !!"
    })}else{
      next(ApiError.resourceNotFound("user not found!!"))
    }
  })
  .catch((err)=>next(err))

}