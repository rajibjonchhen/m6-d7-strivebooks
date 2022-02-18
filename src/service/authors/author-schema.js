import mongoose from "mongoose";

const { Schema, model } = mongoose
const AurthorSchema = new Schema({

		"name":{type:String, required:true},
		"avatar":{type:String},
		"email":{type:String, required:true}
    },
    {
        timestamps: true,
      }          
)

export default model("Author", AurthorSchema )