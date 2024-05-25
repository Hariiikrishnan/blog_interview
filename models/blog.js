import mongoose from 'mongoose';


const blogSchema = new mongoose.Schema({
  b_id:String,
  author:String,
    title:String,
    content:String,
    comments:[
      {
        comment:String,
        u_id:String,
      }
    ],
  });



  const Blog = new mongoose.model("Blog",blogSchema);

  export default Blog;