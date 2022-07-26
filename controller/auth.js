const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const User = require("../models/user");
const Comment= require("../models/comments")
const Secret = require("../models/secret")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ... req body
//  {
//      "username" : "somename",
//      "password" : "123456",
//      "avatar" : "localhost:{port}/male/male_1.png",
//      "gender" : "Male"
//  }

// ... response body
// {
//   "status": "Success",
//  " message": "Auth successful",
//   "user_id": user_id,
//   "token": token,
//   "username": username,
//   "avatar" : avatar,
//   "gender" : gender
//   }

exports.signup = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const avatar = req.body.avatar;
  const gender = req.body.gender;
  const d_token= req.body.d_token;

  User.find({ username: username })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        next(ApiError.resourceConflict("username already exists!"));
        return
      }

      console.log(`sign up  with username ${username}, password : ${password} & its length ${password.lenght}`)
      if (password.length < 6) {

        next(
          ApiError.unprocessableEntity(
            "minimum length of password  should be 6"
          )
        );
        return

      }

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          next(err);
        }
        const user = User({
          _id: new mongoose.Types.ObjectId(),
          username: username,
          password: hash,
          avatar: avatar,
          gender: gender,
          d_token : d_token
        });
        user
          .save()
          .then((user) => {
            console.log(`new Created user : ${user}`);
              res.status(201)
              .json(
                getAuthResponse(username,  user._id, avatar, gender)
              );
          })
          .catch((err) => next(err));
      });
    })
    .catch((err) => next(err));
};



exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const d_token = req.body.d_token;

  User.findOneAndUpdate({ username: username },{$set : {d_token : d_token}},{ new: true })
    .exec()
    .then((users) => {
      if (users ==null || users.lenght < 1) {
        next(ApiError.unauthorizedResponse("Incorrect username or password"));
      } else {
        bcrypt.compare(password, users.password, (error, result) => {
          if (result) {
            res
              .status(200)
              .json(
                getAuthResponse(
                  username,
                  users._id,
                  users.avatar,
                  users.gender
                )
              ); 
          }else{
            next(
              ApiError.unauthorizedResponse(
                "Incorrect username or password"
              )
            )
          }
            if(error){
            console.log(error);
            next(
              ApiError.unauthorizedResponse(
                "Incorrect username or password"
              )
            );}
          
        });
      }
    }
    )
    .catch((error) => next(error));
};



function getAuthResponse(username,user_id, avatar, gender) {
  const token = jwt.sign(
    {
      _id: user_id,
      username: username,
      gender: gender,
      avatar : avatar
    },
    process.env.JWT_KEY,
  );

  return {
    status: "Success",
    message: "Auth successful",
    avatar: avatar,
    user_id: user_id,
    token: token,
    username: username,
    gender: gender,
  };
}

exports.deactivateAccount = async (req,res,next)=>{
const logged_user_id = req.user_data._id;
try{
 await Comment.find({commenter : logged_user_id}).then(async (result)=>{
    result.map(async (p_cmt_to_del)=>{
     await Comment.deleteOne({_id : p_cmt_to_del}).exec() //comment
     await Comment.deleteMany({parent_comment_id : p_cmt_to_del}).exec()//reply
     await Comment.deleteMany({parent_reply_id : p_cmt_to_del}).exec() // reply to reply
    })

   await Secret.find({author: logged_user_id})
    .then(async (result)=>{
      result.map(async(secret)=>{
      await  Comment.deleteMany({secret_id : secret._id})
      await Secret.deleteOne({_id:secret._id})
      })
    }).catch((err)=>next(err))

    User.deleteOne({_id : logged_user_id}).then((result)=>{
      if(result){
        res.status(200).json({
          status : "Success",
          message: "Account deleted successfully!!"
        })
      }
    }).catch((err)=>next(err))
  }).catch((err)=>next(err))
  }catch(err){
    next(ApiError.unprocessableEntity(err.message||"Something went wrong!!"))
  }
  
}

exports.updateAvatar =(req,res,next)=>{
  const new_avatar = req.body.new_avatar;
  const logged_user_id = req.user_data._id;
  if(new_avatar.lenght >0) next(ApiError.badRequest("Required parameter is missing!!"))
  User.findOneAndUpdate({_id:logged_user_id}, {$set : {avatar : new_avatar}}, {new :true }).then((result)=>{
    if(result) res.status(200).json(getAuthResponse(result.username,result._id, result.avatar, result.gender))
  }).catch((err)=>next(err))
}

exports.changePassword = (req,res,next)=>{
   const new_password = req.body.new_password;
   const old_password = req.body.old_password; //incase if  token 
   const logged_user_id = req.user_data._id;

   User.findOne({_id : logged_user_id} ).exec()
   .then((user)=>{
   if(user){
   bcrypt.compare(old_password,user.password).then((isPasswordMatched)=>{
    if(isPasswordMatched){
      bcrypt.hash(new_password, 10, (err, hash) => {
        if (err)  next(err);
        
        User.findOneAndUpdate({_id:logged_user_id},{$set:{password : hash}}).then((result)=>{
          res.status(200).json({satus : "Success",msg:"Password Changed!!"})
        }).catch((err)=>next(err))
      });
    } else next(ApiError.badRequest("Old password is incorrect!!"))
   }).catch((err)=>next(err))
   }else{
    next(ApiError.resourceNotFound("user not found!!"))
   }
   }).catch((err)=>next(err))
   
}
 

 