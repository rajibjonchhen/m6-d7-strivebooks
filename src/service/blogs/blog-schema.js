import mongoose from "mongoose";

const { Schema, model } = mongoose
const blogSchema = new Schema({
    
	    "category": {type:String, required:true, enum:['Horror','Romantic','History','Scifi']},
	    "title": {type:String, required:true},
	    "cover":{type:String},
	    "readTime": {
	      "value": Number,
	      "unit": String
	    },
	    "authors": [{type : Schema.Types.ObjectId, ref:"Author"
	    }],
	    "content": String,
		"reviews": [{
			comment:String,
			rate: Number
		}]
    },
    {
        timestamps: true,
      }          
)

export default model("Blogs", blogSchema )