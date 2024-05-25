import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportlocalmongoose from "passport-local-mongoose";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config()

const userSchema = new mongoose.Schema({
    u_id:String,
    username:String,
    
  });
  userSchema.plugin(passportlocalmongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });
// passport.deserializeUser(function (id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
// passport.deserializeUser(function (id, done) {

//   //   User.findById(id, function (err, user) {
//   //   done(err, user);
//   // });
//     User.findById(id).then((currentuser)=>{
//       done(currentuser);
//     }).catch((err)=>{
//       done(err);
//     })
// });

passport.deserializeUser(async (id, done) => {
  try {
    return done(null, await User.findById(id));
  } catch(error) {
    return done(error);
  } 
});



app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());

export default User;
