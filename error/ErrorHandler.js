const ApiError = require("./ApiError");

function apiErroHandler(err , req, res, next) {
  // in prod, don't use console.log or console.err because
  // it is not async
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.code).json({
      status: "Failure",
      message : err.message
    });
    return;
  }

  res.status(500).json({
    status: "Failure",
    message :err._message?? err.message??"something went wrong!"
  });
}

module.exports = apiErroHandler;
