const express = require("express");
const router = express.Router();
const check_auth = require("../middleware/check-auth");
const commentsController = require("../controller/comments")

router.get("/secrets/:secret_id",check_auth,commentsController.get_comments)
router.post("/", check_auth,commentsController.post_comment );
router.put("/", check_auth,commentsController.updateCommentOrReply );
router.delete("/:comment_id", check_auth, commentsController.delete_comment_by_id);
router.put("/like/:compliment_id", check_auth, commentsController.like_comment);
router.delete("/dislike/:compliment_id", check_auth,commentsController.dislike_comment);
router.post("/replies",check_auth,commentsController.reply_comment)
// router.get("/:comment_id",check_auth,commentsController.get_comment_by_id)
router.get("/replies/:parent_comment_id",check_auth,commentsController.get_replies_by_comment_id)
module.exports = router;