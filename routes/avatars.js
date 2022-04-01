const express = require("express");
const router = express.Router();

router.get("/female", (req, res, next) => {
  const list = [
    `${process.env.baseurl}:${process.env.port}avatars/female/female_1.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_2.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_3.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_4.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_5.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_6.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_7.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_8.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_9.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_10.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_11.png`,
    `${process.env.baseurl}:${process.env.port}avatars/female/female_12.png`,
  ];
  res.status(200)
    .json({
      message : "You need add baseUrl as a prefix to them",
      avatarList : list
    });
});

router.get("/male", (req, res, next) => {
  const list = [
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_1.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_2.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_3.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_4.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_5.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_6.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_7.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_8.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_9.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_10.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_11.png`,
    `${process.env.baseurl}:${process.env.port}/avatars/male/male_12.png`,
  ];
  res
    .status(200)
    .json({
     avatarList : list
    });
});

module.exports=router;
