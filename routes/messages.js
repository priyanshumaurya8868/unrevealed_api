const express = require("express");
const router = express.Router();
const Message = require('../models/message')
const Conversation = require('../models/conversation')
const checAuth  = require('../middleware/check-auth')


// {
//   "senderId" :  "",
//   "conversationId" : "",
//   "text" : ""
// }

//send msg
router.post("/",checAuth, async (req, res) => {
    const newMessage = new Message(req.body);
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //get msges // open chat
  router.get("/:conversationId",checAuth,async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

module.exports = router;
