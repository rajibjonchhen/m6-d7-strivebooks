import mongoose from "mongoose";

const { Schema, model } = mongoose
const userSchema = new Schema({
    
	    "category": {type:String, required:true},
	    "title": {type:String, required:true},
	    "cover":{type:String, required:true},
	    "readTime": {
	      "value": Number,
	      "unit": String
	    },
	    "author": {
	      "name":{type:String, required:true},
	      "avatar":{type:String, required:true}
	    },
	    "content": String,
    },
    {
        timestamps: true,
      }          
)

export default model("Blogs", userSchema )