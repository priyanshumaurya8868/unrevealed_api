const express = require("express");
const mongoose = require("mongoose");
const ApiError = require("../error/ApiError");
const Secret = require("../models/secret");
const Comment = require("../models/comments");
const User = require("../models/user");
const stringExtentions= require("../utils/stringExtentions")
// const check_auth = require("../middleware/check-auth");

// {
// "content": "this is my secret, that now i'm going to reaveal annoymounsly",
// "tag": "relationship"
// }

exports.reveal_secret = (req, res, next) => {
  console.log(`Entered json Body ${req.body}`);
  const secret = new Secret({
    _id: new mongoose.Types.ObjectId(),
    content: req.body.content,
    author: req.user_data._id,
    tag: req.body.tag.toLowerCase(),
  });
  secret
    .save()
    .then((result) => {
      console.log("SAVED SECRET : " + result);

      Secret.findOne({ _id: result._id })
        .populate("author")
        .exec()
        .then(async (result) => {
          res.status(201).json(await feedsSecret(result));
        })
        .catch((err) => next(err));
    })
    .catch((error) => {
      console.log(error);
      next(ApiError.badRequest(error.message));
    });
};

exports.get_secrets = async (req, res, next) => {
  const limit = Number(req.query.limit || 20);
  const skip = Number(req.query.skip || 0);
  const author_id = req.query.author_id;
  const tag = (req.query.tag || "").toLowerCase()
  const total_count = await Secret.countDocuments({});
 if(author_id != null){
  Secret.find({
    tag: { $regex: ".*" + tag + ".*" },
    author: author_id
  })
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort({ createdAt: -1 })
    .exec()
    .then(async (secrets) => {
      const obj = {
        status: "Success",
        total_count: total_count,
        skip: skip,
        limit: limit,
        tag:tag||"All",
        present_count: secrets.length,
      };
    
      if (secrets.length > 0) {
        res.status(200).json({
          ...obj,
          secrets: await Promise.all(secrets.map(feedsSecret)),
        });
      } else {
        res.status(200).json({
          ...obj,
          secrets: [],
        });
      }
    })
    .catch((error) => next(error));
 }else{
  Secret.find({
    tag: { $regex: ".*" + tag + ".*" },
  })
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort({ createdAt: -1 })
    .exec()
    .then(async (secrets) => {
      const obj = {
        status: "Success",
        total_count: total_count,
        skip: skip,
        limit: limit,
        tag:tag||"All",
        present_count: secrets.length,
      };
      if (secrets.length > 0) {
        res.status(200).json({
          ...obj,
          secrets: await Promise.all(secrets.map(feedsSecret)),
        });
      } else {
        res.status(200).json({
          ...obj,
          secrets: [],
        });
      }
    })
    .catch((error) => next(error));
 }
};

exports.get_my_secrets = (req, res, next) => {
  const user_id = req.user_data._id;
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;
  const tag = req.query.tag|| "";

  Secret.find({ author: user_id,  tag: { $regex: ".*" + tag + ".*" } })
    .skip(skip)
    .limit(limit)
    .populate(["author"])
    .sort({ createdAt: -1 })
    .exec()
    .then(async (secrets) => {
      console.log(secrets);
      res
        .status(200)
        .json({
          status: "Success",
          count: secrets.length,
          secrets: await Promise.all(secrets.map(feedsSecret)),
        })
    }) .catch((error) => next(error));
};

exports.update_secret = (req, res, next) => {
  const secret_id = req.body.secret_id;
  const updated_content = req.body.content;
  const updated_tag = req.body.tag.toLowerCase();
  const logged_user_id = req.user_data._id;
  if(stringExtentions.isBlank(updated_content)){
    next(ApiError.unprocessableEntity("Blank or invalid content!!"))
  }
  if(stringExtentions.isBlank(updated_tag)){
    next(ApiError.unprocessableEntity("Blank or invalid tag!!"))
  }
  Secret.findOneAndUpdate(
    { _id: secret_id, author : logged_user_id },
    {
      $set: { content: updated_content, tag : updated_tag },
    },
    { new: true }
  )
    .populate(["author"])
    .exec()
    .then(async (result) => {
      if(result){res.json(await detailedSecret(result));}
      else next(ApiError.unauthorizedResponse("You dont have permission to update this !!"))
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
    .then( (result) => {
      if (result) {
        console.log(`Log user : ${logged_user_id}`);
        console.log(`actual author : ${result.author}`);
        if (result.author == logged_user_id) {
         Secret.deleteOne({ _id: secret_id })
            .exec()
            .then(async(result) => {
              Comment.deleteMany({secret_id : secret_id}).exec().then((result2)=>{
                res.status(200).json({
                  status: "Success",
                  message: "Secret Deleted!",
                });
              })
            .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
        else {
          next(
          ApiError.unauthorizedResponse(
            "User dont have privilege to delete this, only author can do this."
          )
        );}
      } else {
        next(ApiError.resourceNotFound("Resource Not Found!"));
      }
    })
    .catch((err) => next(err));
};

exports.get_tags = (req,res,next)=>{

 const default_tags = [
    "Life",
    "Food",
    "Stimulants",
    "Music",
    "Fitness",
    "Travel",
    "Work",
    "Second-thoughts",
    "Investments",
    "Politics",
    "Startups",
    "Sports",
    "Automobile",
    "Education",
    "Technology",
    "Movies",
    "TV Series",
    "Books",
    "Stand-up",
    "Creativity",
    "Universe",
    "Philosophy",
    "Relationships",
    "Pets",
    "Fashion",
    "Feminism",
    "Depression",
    "Guilt",
    "Dreams", 
    "Social Cause",
    "Marriage"
    ]

    res.status(200).json({
      tags : default_tags,
      status : "Success",
      total_count : default_tags.length
    })

}

async function feedsSecret(secret) {
  var content_str = "";
  const stringLength = 150;
  if (secret.content.length > stringLength) {
    content_str = secret.content.substring(0, stringLength) + "...";
  } else {
    content_str = secret.content;
  }
 const obj = {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
      _id: secret.author._id,
      gender: secret.author.gender,
    },
    tag: capitalizeFirstLetter(secret.tag),
    content: content_str,
    timestamp: secret.createdAt,
    views_count: secret.views_count,
    comments_count: await Comment.countDocuments({ secret_id: secret._id,is_reply : false }),
  };
  console.log(obj)
  return obj;
}

async function detailedSecret(secret) {
  return {
    _id: secret._id,
    author: {
      username: secret.author.username,
      avatar: secret.author.avatar,
      _id: secret.author._id,
      gender: secret.author.gender,
    },
    tag: secret.tag,
    content: secret.content,
    timestamp: secret.createdAt,
    views_count: secret.views_count,
    comments_count: await Comment.countDocuments({ secret_id: secret._id }),
  };
}




function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}