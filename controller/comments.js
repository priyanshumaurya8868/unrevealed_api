const express = require("express");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const Comment = require("../models/comments");
const Secret = require("../models/secret");
const stringExtentions = require("../utils/stringExtentions")
const FCM = require("fcm-node");
const User = require("../models/user");
const server_key = process.env.server_key
const fcm = new FCM(server_key);



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
        .then(async (comment) => {
         
        //send notification
         if(logged_user_id != comment.commenter._id){
           Secret.findOne({_id : secret_id})
          .populate("author")
          .exec()
          .then((post)=>{
           const post_owner_d_token  = post.author.d_token
           const tittle = comment.commenter.username
           const description = "Commented On You Post \""+ comment.content+ "\""
           const dp = comment.commenter.avatar
           const route = "view_secret_screen" + "?secret_id=" + comment.secret_id
           sendnotification(post_owner_d_token,tittle,description,dp,route)
          }).catch((err)=>next(err))
        }

          console.log(comment);
          res.status(201).json(
            await briefComment(comment, logged_user_id)
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

        // send notification
       if(logged_user_id != result.commenter._id){
         User.findOne({_id : logged_user_id}).exec()
        .then((liker)=>{
          const liker_name = liker.username
          const description = "Liked you compliment \"" + result.content +"\""
          const route  = "view_secret_screen" + "?secret_id=" + result.secret_id
          sendnotification(result.commenter.d_token,liker_name, description, liker.avatar, route  )
        }).catch((err)=>next(err))
      }

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
  const mention_uid = req.body.mention_uid;
  const secret_id = req.body.secret_id;
  const str = req.body.reply;
  const logged_user_id = req.user_data._id;

  var secret 
  var parent_comment
  try {
     secret = await Secret.findOne({ _id: secret_id }).populate("author");
    if (secret == null) {
      next(ApiError.resourceNotFound("No Such secret exists"));
      return;
    }
  } catch (err) {
    next(ApiError.unprocessableEntity("Invalid secret_id"));
  }

  try {
     parent_comment = await Comment.findOne({ _id: parent_comment_id }).populate("commenter");
    if (parent_comment == null) {
      next(ApiError.resourceNotFound("No Such comment exists"));
      return;
    }
  } catch (err) {
    next(ApiError.unprocessableEntity("Invalid parent_comment_id"));
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
         
         if(logged_user_id != mention_uid){ User.findOne({_id : mention_uid}).exec()
          .then((mentioned_user)=>{
             sendnotification(
              mentioned_user.d_token,
              reply.commenter.username,
              `Mentioned you in a comment \"${reply.content}\"`,
              reply.commenter.avatar,
              "view_secret_screen" + "?secret_id=" + reply.secret_id
             )
          })
          .catch((err)=>next(err))
        }
 
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


const sendnotification = (d_token, title, description,dp,screen_route)=>{

  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to:d_token,
    collapse_key: 'your_collapse_key',
    
    notification: {
      
        title: title, 
        body: description ,
    },
    
    data: {  //you can send only notification or only data(or include both)
        screen_route: screen_route,
        dp : dp
    }
};

fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Successfully sent with response: ", response);
    }
});
}