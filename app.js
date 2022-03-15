const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const morgan = require("morgan");
const ApiError = require("./error/ApiError");
const app = express("morgan");
const apiErroHandler = require('./error/ErrorHandler');
const secretsResource = require('./routers/Secrets')

app.use(morgan("dev")); //logging
app.use(express.urlencoded({ extended: true })); //for encoding params
app.use(express.json()); // json body parser

//defining Origin
// u can uneven restrict it app.header('Allow-Control-Allow-Origin','https://myCoolPage.com')
app.use((req, res, next) => {
  res.header("Allow-Control-Allow-Origin", "*");


//defining headers that can be send with request
  res.header(
    "Allow-Control-Allow-Header",
    "Origin,Content-Type,X-Requested-With,Accept,Authorization"
  );
  //since browser  always  sent the options request whenever  u send PUT or POST 
if(req.method == "OPTIONS"){
    res.header(
        "Allow-Control-Allow-Methods",
        "GET, PUT, POST, DELETE"
    )
    return res.status(200).json({}); //since at this point we dont want to respose our routes
}
next();
});

app.use("/secrets",secretsResource)

app.use((req,res,next)=>{
    next(ApiError.badRequest('msg field is required and must be non blank'));
});

app.use(apiErroHandler);

module.exports = app;


