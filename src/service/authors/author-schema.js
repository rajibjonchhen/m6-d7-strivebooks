import mongoose from "mongoose";
import bcrypt from "bcrypt"

const { Schema, model } = mongoose
const AurthorSchema = new Schema({

		"name":{type:String, required:true},
		"avatar":{type:String},
		"email":{type:String, required:true, unique:true},
		"password":{type:String, required:true},
    "role" : {type:String, enum:["user", "admin"]}
    },
    {
        timestamps: true,
      }          
)
AurthorSchema.pre("save", async function(next){
  const newAuthor = this
  const plainPw  = newAuthor.password

  if(newAuthor.isModified("password")){
    const hash = await bcrypt.hash(plainPw, 12)
    newAuthor.password = hash
  }
  next()
})

AurthorSchema.methods.toJSON = function(){
  const authorDocument = this 
  const authorObject = authorDocument.toObject()
  delete authorObject.password
  return authorObject
}

AurthorSchema.statics.checkCredentials = async function(email, plainPw){

  const author = await this.findOne({email})

  if(author){

    const isMatch = await bcrypt.compare(plainPw, author.password)

    if(isMatch){

      return author

    }else {

      return null
    }

}else{

  return null
  }
}
export default model("Author", AurthorSchema )