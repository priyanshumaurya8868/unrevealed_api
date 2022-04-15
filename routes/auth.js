const express = require("express");
const router = express.Router();
const User = require("../models/user");
const check_auth = require("../middleware/check-auth");
const authController = require("../controller/auth") 
const ApiError = require("../error/ApiError");



router.post("/signup",authController.signup  );

router.post("/login",authController.login);



module.exports = router;








// router.delete("/:user_id", (req, res, next) => {
//   User.remove({ _id: req.body.user_id })
//     .exec()
//     .then((result) => {
//       res.status(200).json({
//         message: "user deleted!",
//       });
//     })
//     .catch((error) => next(error));

//     //TODO 1: comment made by user
//     //TODO 2: secrets revealed by the user
//       TODO 3 : comments get by  the user
//        3.1 => track on which which post he has made comment
// });