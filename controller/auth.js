const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const check_auth = require("../middleware/check-auth");

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

  User.find({ username: username })
    .exec()
    .then((result) => {
      if (result.length >= 1) {
        next(ApiError.resourceConflict("username already exists!"));
      }

      if (password.length < 6) {
        next(
          ApiError.unprocessableEntity(
            "minimum length of password  should be 6"
          )
        );
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
        });
        user
          .save()
          .then((user) => {
            console.log(`new Created user : ${user}`);
            res
              .status(201)
              .json(
                getAuthResponse(username, password, user._id, avatar, gender)
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

  User.findOne({ username: username })
    .exec()
    .then((users) => {
      if (users.lenght < 1) {
        next(ApiError.unauthorizedResponse("Incorrect username or password"));
      } else {
        bcrypt.compare(password, users.password, (error, result) => {
          if (result) {
            res
              .status(200)
              .json(
                getAuthResponse(
                  username,
                  password,
                  users._id,
                  users.avatar,
                  users.gender
                )
              );
          }
            if(error)
            console.log(error);
            next(
              ApiError.unauthorizedResponse(
                "Incorrect username or password"
              )
            );
          
        });
      }
    })
    .catch((error) => next(error));
};



function getAuthResponse(username, password, user_id, avatar, gender) {
  const token = jwt.sign(
    {
      _id: user_id,
      username: username,
      password: password,
      gender: gender,
    },
    process.env.JWT_KEY,
    { expiresIn: "7d" }
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

