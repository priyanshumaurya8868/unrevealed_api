const express = require("express");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const Secret = require("../models/secret");
const Comment = require("../models/comments");
const { findOne, findOneAndDelete } = require("../models/secret");
// const check_auth = require("../middleware/check-auth");

{
  // "content": "this is my secret, that now i'm going to reaveal annoymounsly"
}

exports.reveale_secret = (req, res, next) => {
  console.log(`Entered json Body ${req.body}`);
  const secret = new Secret({
    _id: new mongoose.Types.ObjectId(),
    content: req.body.content,
    author: req.user_data._id,
  });
  secret
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json(feedsSecret(secret));
    })
    .catch((error) => {
      console.log(error);
      next(ApiError.badRequest(error.message));
    });
};

exports.get_secrets = (req, res, next) => {
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  Secret.find()
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort("-timestamp")
    .exec()
    .then((secrets) => {
      console.log(secrets);
      res.status(200).json({
        status: "Success",
        count: secrets.length,
        secrets: secrets.map((secret) => feedsSecret(secret)),
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
    .sort("-timestamp")
    .exec()
    .then((secrets) => {
      console.log(secrets);
      res.status(200).json({
        status: "Success",
        count: secrets.length,
        secrets: secrets.map((secret) => feedsSecret(secret)),
      });
    })
    .catch((error) => next(error));
};

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
    .populate(["author", "comments"])
    .populate({
      path: "comments",
      populate: {
        path: "commenter",
        model: "User",
        select: "username avatar",
      },
    })
    .exec()
    .then((result) => {
      res.json(feedsSecret(result));
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
    .populate(["author", "comments"])
    .populate({
      path: "comments",
      populate: {
        path: "commenter",
        model: "User",
        select: "username avatar",
      },
    })
    .exec()
    .then((result) => {
      if (result) res.status(200).json(detailedSecret(result, logged_user_id));
      else next(ApiError.resourceNotFound("No such secret exists!"));
    })
    .catch((err) => next(err));
};

exports.delete_secret_by_id = async(req, res, next) => {
  const secret_id = req.params.secret_id;
  const logged_user_id = req.user_data._id;
 await Secret.findById(secret_id)
    .then(async (result) => {
      if (result) {
        console.log(`Log user : ${logged_user_id}`)
        console.log(`actual author : ${result.author}`)
        if (result.author == logged_user_id) {
          await Secret.deleteOne( {_id : secret_id} )
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

//->validate->save->findSecret->indexed
exports.post_comment = (req, res, next) => {
  const str = req.body.comment;
  const secret_id = req.body.secret_id;
  const logged_user_id = req.user_data._id;

  if (!str || str.trim().length === 0) {
    next(ApiError.unprocessableEntity("Comment can't be blank!"));
  }
  Comment({
    _id: mongoose.Types.ObjectId(),
    content: str,
    secret_id: secret_id,
    commenter: logged_user_id,
  })
    .save()
    .then((cmt) => {
      Secret.findOneAndUpdate(
        secret_id,
        {
          $push: { comments: cmt._id },
          $inc: { comments_count: 1 },
        },
        { new: true }
      )
        .populate(["author", "comments"])
        .populate({
          path: "comments",
          populate: {
            path: "commenter",
            model: "User",
            select: "username avatar",
          },
        })
        .exec()
        .then((result) => {
          if (result) {
            res.status(201).json(detailedSecret(result));
          } else {
            next(ApiError.resourceNotFound("No secret exists!"));
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.delete_comment_by_id = async function(req, res, next) {
  try {
    const comment_id = req.params.comment_id;

    Comment.findOneAndDelete({ _id: comment_id })
      .exec()
      .then(async (result) => {
       await  Secret.findOneAndUpdate(
          { _id: result.secret_id },
          { $pull: { comments: result._id } }
        )
          .exec()
          .then((result) => {
            res
              .status(200)
              .json({ status: "Success", message: "Comment deleted!" });
          });
      })
      .catch((err) => {});
  } catch (err) {
    next(err);
  }
};

exports.like_comment = (req, res, next) => {
  const comment_id = req.params.comment_id;
  const logged_user_id = req.user_data._id;
  Comment.findOneAndUpdate(
    { _id: comment_id },
    { $addToSet: { liked_by: logged_user_id } }
  )
    .populate("commenter", ["avatar", "username", "_id"])
    .exec()
    .then((result) => {
      if (result) {
        res.status(201).json(result);
      } else next(ApiError.resourceNotFound("Comment not Found!"));
    })
    .catch((err) => next(err));
};

exports.dislike_comment = (req, res, next) => {
  const comment_id = req.params.comment_id;
  const logged_user_id = req.user_data._id;
  Comment.findOneAndUpdate(
    { _id: comment_id },
    { $pull: { liked_by: logged_user_id } }
  )
    .populate("commenter", "avatar", "username", "_id")
    .exec()
    .then((result) => {
      if (result) {
        res.status(201).json(result);
      } else next(ApiError.resourceNotFound("Comment not Found!"));
    })
    .catch((err) => next(err));
};

function feedsSecret(secret) {
  return {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
      _id: secret.author._id,
    },
    content: secret.content,
    timestamp: secret.timestamp,
    views_count: secret.views_count,
    Comments_count: secret.comments.length,
  };
}

function detailedSecret(secret) {
  return {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
    },
    content: secret.content,
    timestamp: secret.timestamp,
    views_count: secret.views_count,
    comments_count: secret.comments.length,
    comments: secret.comments,
  };
}
