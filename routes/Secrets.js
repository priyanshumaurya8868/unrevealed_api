const express = require("express");
const router = express.Router();
const check_auth = require("../middleware/check-auth");
const secretController = require("../controller/secrets")

router.post("/", check_auth,secretController.reveal_secret );
router.get("/", check_auth, secretController.get_secrets );
router.get("/my_secrets",check_auth,secretController.get_my_secrets)
router.get("/:secret_id", check_auth, secretController.get_secret_by_id);
router.put("/", check_auth, secretController.update_secret);
router.delete("/:secret_id", check_auth,secretController.delete_secret_by_id);



router.post("/comments", check_auth,secretController.post_comment );
router.delete("/comments/:comment_id", check_auth, secretController.delete_comment_by_id);
router.put("/comments/like/:comment_id", check_auth, secretController.like_comment);
router.delete("/comments/dislike/:comment_id", check_auth, secretController.dislike_comment);



module.exports = router;
