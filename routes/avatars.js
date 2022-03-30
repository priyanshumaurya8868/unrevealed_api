const express = require("express");
const router = express.Router();


router.get("/female", (res, req, next) => {
  const list = [
    "avatars/female/female_1.png",
    "avatars/female/female_2.png",
    "avatars/female/female_3.png",
    "avatars/female/female_4.png",
    "avatars/female/female_5.png",
    "avatars/female/female_6.png",
    "avatars/female/female_7.png",
    "avatars/female/female_8.png",
    "avatars/female/female_9.png",
    "avatars/female/female_10.png",
    "avatars/female/female_11.png",
    "avatars/female/female_12.png",
  ];

  res.status(200)
    .json({
      message : "You need add baseUrl as a prefix to them",
      avatarList : list
    });
});


router.get("/male", (res, req, next) => {
  const list = [
    "/avatars/male/male_1.png",
    "/avatars/male/male_2.png",
    "/avatars/male/male_3.png",
    "/avatars/male/male_4.png",
    "/avatars/male/male_5.png",
    "/avatars/male/male_6.png",
    "/avatars/male/male_7.png",
    "/avatars/male/male_8.png",
    "/avatars/male/male_9.png",
    "/avatars/male/male_10.png",
    "/avatars/male/male_11.png",
    "/avatars/male/male_12.png",
  ];

  res
    .status(200)
    .json({
      message : "You need add baseUrl as a prefix to them",
     avatarList : list
    });
});


module.exports=router;