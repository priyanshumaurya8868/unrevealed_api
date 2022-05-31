const express = require("express");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const Comment = require("../models/comments");
const Secret = require("../models/secret");
const stringExtentions = require("../utils/stringExtentions")

//->validate->save->findSecret->indexed
exports.post_comment = async (req, res, next) => {
  const str = req.body.comment;
  const secret_id = req.body.secret_id;
  const logged_user_id = req.user_data._id;

  //...validate
  if (!str || str.trim().length === 0) {
    next(ApiError.unprocessableEntity("Comment can't be blank!"));
  }
  //...save
  Comment({
    _id: mongoose.Types.ObjectId(),
    content: str,
    secret_id: secret_id,
    commenter: logged_user_id,
  })
    .save()
    .then(async (cmt) => {
      //...returned
      Comment.findOne({ _id: cmt._id })
        .populate("commenter")
        .exec()
        .then(async (result) => {
          console.log(result);
          res.status(201).json(
            await briefComment(result, logged_user_id)
          );
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.delete_comment_by_id = (req, res, next) => {
  const comment_id = req.params.comment_id;
  Comment.findOneAndDelete({ _id: comment_id })
    .exec()
    .then((result) => {
      console.log("comment str : "+ result.content + "commented by-> "+ result.commenter)
      Comment.deleteMany({parent_comment_id : comment_id}).exec()
      .then((result2)=>{
        Comment.deleteMany({parent_reply_id : comment_id}).exec()
        .then((result3)=>{
          res.status(200).json({status: "Success", message : "deleted!"})
        }).catch((err)=>next(err))
      }).catch((err)=>next(err))
    }).catch((err) => next(err));
};

exports.get_comments = async (req, res, next) => {
  const logged_user_id = req.user_data._id;
  const secret_id = req.params.secret_id;
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;
  const total_count = await Comment.countDocuments({ secret_id: secret_id });

  Comment.find({ secret_id: secret_id })
    .skip(skip)
    .limit(limit)
    .populate("commenter")
    .sort({ createdAt: -1 })
    .exec()
    .then(async (result) => {
      console.log(result);
      res.status(200).json({
        status: "Success",
        total_count: total_count,
        skip: skip,
        limit: limit,
        present_count: result.length,
        comments: await Promise.all(
          result.map((comment) =>
            briefComment(comment, logged_user_id)
          )
        ),
      });
    })
    .catch((err) => next(err));
};

exports.like_comment = (req, res, next) => {
  const comment_id = req.params.comment_id;
  const logged_user_id = req.user_data._id;
  Comment.findOneAndUpdate(
    { _id: comment_id },
    { $addToSet: { liked_by: logged_user_id } },
    { new: true }
  )
    .populate("commenter")
    .exec()
    .then(async (result) => {
      if (result) {
        res.status(201).json(
          await briefComment(result, logged_user_id)
        );
      } else next(ApiError.resourceNotFound("Comment not Found!"));
    })
    .catch((err) => next(err));
};

exports.dislike_comment = (req, res, next) => {
  const comment_id = req.params.comment_id;
  const logged_user_id = req.user_data._id;
  Comment.findOneAndUpdate(
    { _id: comment_id },
    { $pull: { liked_by: logged_user_id } },
    { new: true }
  )
    .populate("commenter")
    .exec()
    .then(async (result) => {
      if (result) {
        res.status(201).json(
          await briefComment(result, logged_user_id)
        );
      } else next(ApiError.resourceNotFound("Comment not Found!"));
    })
    .catch((err) => next(err));
};

async function briefComment(comment, logged_user_id) {
  const is_it_a_reply = comment.parent_comment_id != null;
  var id_obj={}
 if(is_it_a_reply){  id_obj = {
    parent_comment_id : comment.parent_comment_id,
    parent_reply_id : comment.parent_reply_id
  }}
  const compliment_obj = {
    ...id_obj,
    _id: comment._id,
    content: comment.content,
    secret_id : comment.secret_id,
    commenter: {
      username: comment.commenter.username,
      _id: comment.commenter._id,
      avatar: comment.commenter.avatar,
      gender: comment.commenter.gender,
    },
    timestamp: comment.createdAt,
    like_count: comment.liked_by.length,
    is_liked_by_me: await comment.liked_by.includes(logged_user_id),
  };
  if (is_it_a_reply) {
    return {
      ...compliment_obj,
      parent_comment_id: comment._id,
    };
  } else {
    return {
      ...compliment_obj,
      reply_count: await Comment.countDocuments({
        parent_comment_id: comment._id,
      }),
    };
  }
}

exports.reply_comment = async (req, res, next) => {
  const parent_reply_id = req.body.parent_reply_id; 
  const parent_comment_id = req.body.parent_comment_id;
  const secret_id = req.body.secret_id;
  const str = req.body.reply;
  const logged_user_id = req.user_data._id;
  try {
    const secret = await Secret.findOne({ _id: secret_id });
    if (secret == null) {
      next(ApiError.resourceNotFound("No Such secret exists"));
      return;
    }
  } catch (err) {
    next(ApiError.unprocessableEntity("Invalid secret_id"));
  }

  Comment({
    _id: mongoose.Types.ObjectId(),
    content: str,
    parent_comment_id: parent_comment_id,
    parent_reply_id:parent_reply_id,
    commenter: logged_user_id,
  })
    .save()
    .then((result) => {
      Comment.findOne({ _id: result._id })
        .populate(["commenter"])
        .exec()
        .then(async (reply) => {
          res.status(201).json(
            await briefComment(reply, logged_user_id)
          );
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.get_comment_by_id = (req, res, next) => {
  const logged_user_id = req.user_data._id;
  const comment_id = req.params.comment_id;
  Comment.findOne({ _id: comment_id })
    .populate(["commenter"])
    .exec()
    .then((parent) => {
      if (parent) {
        Comment.find({ parent_comment_id: parent._id })
          .populate(["commenter"])
          .sort({ createdAt: -1 })
          .exec()
          .then(async (replies) => {
            res.status(200).json({
              ...(await briefComment(parent, logged_user_id)),
              replies: await Promise.all(
                replies.map((reply) =>
                  briefComment(reply, logged_user_id)
                )
              ),
            });
          })
          .catch((err) => next(err));
      } else {
        next(ApiError.resourceNotFound("no comment exists!"));
      }
    })
    .catch((err) => next(err));
};

exports.updateCommentOrReply = async(req,res,next)=>{
  const comment_id = req.body._id;
  const updatedContent = req.body.content;
  const logged_user_id = req.user_data._id
  try{
    if(stringExtentions.isBlank(updatedContent)){
      next(ApiError.unprocessableEntity("Invalid Content!!"))
    }
   
    Comment.findOne({_id:comment_id}).exec().then((comment)=>{
    if(comment.commenter != logged_user_id){
    next(ApiError.unauthorizedResponse("You Dont have privilege to alter this!!"))
  return;
    }
   Comment.findOneAndUpdate(
     {_id : comment_id},
     {$set : {content : updatedContent}},
     { new: true } )
     .populate("commenter")
     .exec()
    .then( async(update)=>{
    res.status(200).json( await briefComment(update,logged_user_id))
    return;
   }).catch((err)=>next(err))
    }).catch((err)=>next(err))  
  
  } catch (err) {
    next(err)
    return;
  }

}


exports.get_replies_by_comment_id = async (req, res, next) => {
  const comment_id = req.params.parent_comment_id;
  const logged_user_id = req.user_data._id;
  try {
    const comment = await Comment.findOne({ _id: comment_id });
    if (comment == null) {
      next(ApiError.resourceNotFound("No such comment exists!!"));
      return;
    }
  } catch (err) {
    next(ApiError.unprocessableEntity("Invalid secret_id"));
    return;
  }

  Comment.find({ parent_comment_id: comment_id })
    .populate("commenter")
    .exec()
    .then(async (replies) => {
      res.status(200).json({
        replies: await Promise.all(
          replies.map((reply) =>
            briefComment(reply, logged_user_id)
          )
        ),
      });
    })
    .catch((err) => next(err));
};


