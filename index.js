    //jshint esversion:6

// const express = require("express");
// const bodyparser = require("body-parser");
// const ejs = require("ejs");
// const mongoose = require("mongoose");


import express from "express";
import bodyParser from "body-parser";

import * as dotenv from "dotenv";
import connectDB from './config/db.js'
import { v4 as uuidv4 } from "uuid";
import passport from "passport";
import session from "express-session";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import {verifyToken} from "./utils/verifyToken.js";

import Blog from "./models/blog.js";;
import User from "./models/user.js";;


const app = express();




dotenv.config();
connectDB();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));


app.use(express.json());

app.use(passport.initialize());
app.use(session({
    secret:process.env.SECRETKEY ,
    resave:false,
    saveUninitialized:false
  }));
app.use(passport.session());


// app.set('view engine','ejs');
// app.use(bodyparser.urlencoded({
//     extended: true
//   }));
//   app.use(express.static("public"));

app.get("/",verifyToken,function(req,res){
    Blog.find().then((blogs)=>{
        console.log(blogs);
 


        res.json({data:blogs,msg:"success"})
    }).catch((error)=>{
        console.log((error));
    })
});


app.post("/add/:u_id",verifyToken,function(req,res){
    const blog = new Blog({
        b_id:uuidv4(),
        // title:"hello",
        // content:"hello",
        comments:[],
        title:req.body.title,
        author:req.params.u_id,
        content:req.body.content,
        // comments:req.body.comments,
    });

    // console.log(blog);

    blog.save().then((result)=>{
        console.log(result);
        res.json({msg:"Success"});
       
    }).catch((err)=>{
        console.log(err);
        })
});

app.get("/blog/:b_id",function(req,res){
    Blog.findOne({b_id:req.params.b_id}).then((blog)=>{
        console.log(blog);

        res.json({data:blog,msg:"success"})
    }).catch((error)=>{
        console.log((error));
    })
});


app.post("/delete/:b_id/:u_id",verifyToken,function(req,res){
   
    Blog.deleteOne({b_id:req.params.b_id,author:req.params.u_id}).then((blog)=>{

        if(blog===undefined || blog===null){
            res.json({msg:"failed"})
        }else{
            res.json({msg:"Success"});
        }
    }).catch((error)=>{
        console.log((error));
    })
});

app.get("/update/:b_id/:u_id",function(req,res){
    
    Blog.findOne({b_id:req.params.b_id,author:req.params.u_id}).then((blog)=>{
        console.log(blog);
        if(blog!==undefined){
            res.json({data:blog,msg:"success"})
        }
    }).catch((error)=>{
        console.log((error));
    })
});



app.post("/update/:b_id/:u_id",verifyToken,function(req,res){
    Blog.findOneAndUpdate(
        {b_id:req.params.b_id,author:req.params.u_id},
        { $set:{ content: req.body.content,title:req.body.title } },
        { new: true, useFindAndModify: false }).then((result)=>{
            console.log(result);
            if(result===undefined || result===null){
                res.json({msg:"failed"})
            }else{
                res.json({msg:"Success"});
            }
        }).catch((err)=>{
            console.log(err);
            })

});


app.post("/addComment/:b_id/:u_id",function(req,res){
    Blog.findOneAndUpdate({b_id:req.params.b_id},
        { $push:{ comments: {
            comment:req.body.comment,
            u_id:req.params.u_id,
        } } },
        { new: true, useFindAndModify: false }).then((result)=>{
            console.log(result);
            if(result===undefined || result===null){
                res.json({msg:"failed"})
            }else{
                res.json({msg:"Success"});
            }
        }).catch((err)=>{
            console.log(err);
            })
});

app.get("/comments/:pgNo/:b_id", async function(req,res){
    const skip = req.params.pgNo ? Number(req.params.pgNo) : 0;
  
    const results =await  Blog.find({ b_id: req.params.b_id })
      .sort({ x: 1, _id: 1 })
      .skip(skip > 0 ? (skip - 1) * 6 : 0)
      .limit(6);

    res.json({ success: true, results: results });

});


app.post("/login",asyncHandler(async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    const user = new User({
      username: username,
      password: password,
    });
    
    
    req.login(user, async function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      } else {

        await passport.authenticate("local")(req, res,  function () {
          var accessToken = jwt.sign({ user }, process.env.SECRETKEY, {expiresIn:"14m"});
     
          
           User.findOne({ username: username }).then((currentUser)=>{
      
            res.json({token:accessToken,user:currentUser});
          }).catch((error)=>{
            console.log(error);
          })
          
        });
      }
    });
  }));


app.post("/register",(req,res)=>{

    User.register(
        { u_id: uuidv4(), 
          
            username:req.body.username},
        req.body.password,
        function (err, user) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          } else {
            passport.authenticate("local")(req, res, function () {
              jwt.sign({ user }, process.env.SECRETKEY, (err, token) => {
                res.json({ token: token, user: user });
              });
            });
          }
        }
      );
})


app.listen(3000,function(req,res){
    console.log("Server Started on Port 3000")
})