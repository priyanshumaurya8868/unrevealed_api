const express = require("express");
const router = express.Router();
const ApiError = require("../error/ApiError");
const check_auth = require("../middleware/check-auth");
const User = require("../models/user");

// 1. get user profile
router.get("/",check_auth,(req,res,next)=>{
    const user= req.user_data;
    User.findOne({_id: user._id}).exec()
    .then((result)=>{
        if (result) {
            res.status(200).json(getUsersResponse(result));
          } else {
              next(ApiError.unauthorizedResponse("wrong crendicials"))
          }
    })
    .catch((err)=>next(err))
})

// 2. authour profile by Id
router.get("/:user_id", check_auth,(req, res, next) => {
  const user_id = req.params.user_id;

  User.findOne({ _id: user_id })
    .exec()
    .then((result) => {
      if (result) {
        res.status(200).json(getUsersResponse(result));
      } else {
          next(ApiError.resourceNotFound("No such user exists!"))
      }
    })
    .catch((err)=>next(err));
});


module.exports = router;

function getUsersResponse(result){
 return {
    user_id: result._id,
    username: result.username,
    avatar: result.avatar,
    gender: result.gender,
  }
     } 