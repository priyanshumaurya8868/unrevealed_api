const express = require('express')
const router = express.Router()

router.get("/", (req,res,next)=>{
  
    res.status(200)
    res.json({
        username : "Priyanshu",
        content : "this is  my screte  that i dont event know the spelling of the secreates",
        views :  103,
    });
});

module.exports = router