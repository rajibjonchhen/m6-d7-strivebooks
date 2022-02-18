import mongoose from "mongoose";

const { Schema, model } = mongoose
const blogSchema = new Schema({
    
	    "category": {type:String, required:true, enum:['Horror','Romantic','History','Scifi','Politics','Tech']},
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
			authorId:String,
			comment:String,
			rate: Number
		}],
		"likes":[{type : Schema.Types.ObjectId, ref:"Author"}]
    },
    {
        timestamps: true,
      }          
)

export default model("Blogs", blogSchema )