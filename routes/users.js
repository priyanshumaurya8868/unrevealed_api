const express = require("express");
const router = express.Router();
const ApiError = require("../error/ApiError");
const check_auth = require("../middleware/check-auth");
const User = require("../models/user");
const user_controller = require("../controller/user")

// 1. get user profile
router.get("/myProfile",check_auth,user_controller.get_user)

router.get("/")
 
// 2. authour profile by Id
router.get("/:user_id", check_auth,user_controller.get_user_by_id);
//update device token
router.put("/devicetoken",check_auth,user_controller.recieveDeviceToken)

module.exports = router;

