const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
const mongoose  = require("mongoose");
const morgan = require("morgan");
const ApiError = require("./error/ApiError");
const app = express("morgan");
const apiErroHandler = require('./error/ErrorHandler');
const secretsRoute = require('./routes/Secrets')
const authRoute = require("./routes/auth")
const avatarsRoute = require("./routes/avatars")
const usersRoute = require("./routes/users")

mongoose.connect("mongodb://localhost:27017/unrevealed?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false")

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
app.use(express.static('images'))
app.use("/avatars",avatarsRoute)
app.use("/secrets",secretsRoute)
app.use("/auth",authRoute)
app.use("/users",usersRoute)


app.use((req,res,next)=>{
    next(ApiError.badRequest('Something went wrong!'));
});

app.use(apiErroHandler);

module.exports = app;


