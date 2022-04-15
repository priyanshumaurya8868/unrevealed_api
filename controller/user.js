const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const check_auth = require("../middleware/check-auth");


exports.get_user= (req,res,next)=>{
const user_id = req.user_data._id
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