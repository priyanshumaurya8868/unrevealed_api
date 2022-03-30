const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const arr = req.headers.authorization.split(" ");
    const token = arr[1];
    console.log(`got token => ${token}`);
    const decode = jwt.verify(token, process.env.JWT_KEY);
    console.log("User Data => " + decode.toString());
    req.user_data = decode;
    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      status: "Failure",
      message: "Token authentication failed!",
    });
  }
};
