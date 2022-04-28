const jwt = require("jsonwebtoken");
const User = require("../models/user")
module.exports = async (req, res, next) => {
  try {
    const arr = req.headers.authorization.split(" ");
    const token = arr[1];
    console.log(`got token => ${token}`);
    const decode = jwt.verify(token, process.env.JWT_KEY);
    console.log("User Data => " + decode.toString());
    req.user_data = decode;

    filter_dict = {"_id":decode._id}
if (await User.findOne(filter_dict)){
    console.log("item is existed")

    // setTimeout(function() {
    //   console.log('hello world!');
    //   next();
    // }, 5000);

    next(); 
  }
else{
    console.log("item is not existed")
    res.status(401).json({
      status: "Failure",
      message: "Token authentication failed!",
    });
  }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: "Failure",
      message: "Token authentication failed!",
    });
  }
};
