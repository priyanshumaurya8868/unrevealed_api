const express = require("express");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const Secret = require("../models/secret");
const Comment = require("../models/comments");
const User = require("../models/user");
// const check_auth = require("../middleware/check-auth");

// {
// "content": "this is my secret, that now i'm going to reaveal annoymounsly"
// }

exports.reveal_secret = (req, res, next) => {
  console.log(`Entered json Body ${req.body}`);
  const secret = new Secret({
    _id: new mongoose.Types.ObjectId(),
    content: req.body.content,
    author: req.user_data._id,
    tag:req.body.tag,
    timestamp: "$$NOW"
  });
  secret
    .save()
    .then((result) => {
      console.log("SAVED SECRET : " + result);

      Secret.findOne({ _id: result._id })
        .populate("author")
        .exec()
        .then(async (result) => {
          res.status(201).json( await feedsSecret(result));
        })
        .catch((err) => next(err));
    })
    .catch((error) => {
      console.log(error);
      next(ApiError.badRequest(error.message));
    });
};

exports.get_secrets = async (req, res, next) => {
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;
  const total_count = await Secret.countDocuments({});
  Secret.find()
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort({createdAt: -1})
    .exec()
    .then( async (secrets) => {

      console.log(secrets);
      res.status(200).json({
        status: "Success",
        total_count: total_count,
        skip: skip,
        limit: limit,
        present_count: secrets.length,
        secrets:  await Promise.all( secrets.map(feedsSecret))
        // secrets.map(async(secret)=>await feedsSecret(secret))
      });
    })
    .catch((error) => next(error));
};

exports.get_my_secrets = (req, res, next) => {
  const user_id = req.user_data._id;
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  Secret.find({ author: user_id })
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort({createdAt: -1})
    .exec()
    .then(async(secrets) => {
      console.log(secrets);
      res.status(200).json({
        status: "Success",
        count: secrets.length,
        secrets:  await Promise.all( secrets.map(feedsSecret))
    })
    .catch((error) => next(error));
}
    )}

exports.update_secret = (req, res, next) => {
  const secret_id = req.body.secret_id;
  const updated_content = req.body.content;
  Secret.findOneAndUpdate(
    { _id: secret_id },
    {
      $set: { content: updated_content },
    },
    { new: true }
  )
    .populate(["author"])
    .exec()
    .then(async (result) => {
      res.json(await detailedSecret(result));
    })
    .catch((err) => next(err));
};

exports.get_secret_by_id = (req, res, next) => {
  const secret_id = req.params.secret_id;
  const logged_user_id = req.user_data._id;
  Secret.findOneAndUpdate(
    { _id: secret_id },
    { $inc: { views_count: 1 } },
    { new: true }
  )
    .populate(["author"])
    .exec()
    .then(async (result) => {
      if (result) res.status(200).json(await detailedSecret(result));
      else next(ApiError.resourceNotFound("No such secret exists!"));
    })
    .catch((err) => next(err));
};

exports.delete_secret_by_id = async (req, res, next) => {
  const secret_id = req.params.secret_id;
  const logged_user_id = req.user_data._id;
  await Secret.findById(secret_id)
    .then(async (result) => {
      if (result) {
        console.log(`Log user : ${logged_user_id}`);
        console.log(`actual author : ${result.author}`);
        if (result.author == logged_user_id) {
          await Secret.deleteOne({ _id: secret_id })
            .exec()
            .then((result) => {
              res.status(200).json({
                status: "Success",
                message: "Secret Deleted!",
              });
            })
            .catch((err) => next(err));
        }
        next(
          ApiError.unauthorizedResponse(
            "User dont have privilege to delete this, only author can do this."
          )
        );
      } else {
        next(ApiError.resourceNotFound("Resource Not Found!"));
      }
    })
    .catch((err) => next(err));
};

async function feedsSecret(secret) {
  var content_str = "";
  if(secret.content.length > 120){
content_str = secret.content.substring(0,120)+"..."
  }else {
 content_str = secret.content
  }
  return {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
      _id: secret.author._id,
      gender : secret.author.gender
    },
    tag:secret.tag,
    content: content_str,
    timestamp: secret.createdAt,
    views_count: secret.views_count,
    comments_count: await Comment.countDocuments({ secret_id: secret._id }),
  };
}

async function detailedSecret(secret) {
  return {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
      _id: secret.author._id,
      gender : secret.author.gender
    },
    tag:secret.tag,
    content: secret.content,
    timestamp: secret.createdAt,
    views_count: secret.views_count,
    comments_count: await Comment.countDocuments({ secret_id: secret._id }),
  };
}
