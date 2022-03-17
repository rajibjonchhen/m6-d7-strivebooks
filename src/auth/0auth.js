import passport from 'passport'
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../service/authors/author-schema.js"
import { authenticateAuthor } from './tools.js';

const googleStrategy = new GoogleStrategy({
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL:`${process.env.API_URL}/authors/googleRedirect`
},
async(accessToken, refreshToken, profile, passportNext) => {
    try {
        const author = await AuthorModel.findOne({email:profile.emails[0].value})
        
        if(author){
            const token = await authenticateAuthor(author)
            console.log("validated author and token is", token)
            passportNext(null,{token, role:author.role})
        } else{
            
            const newAuthor = new AuthorModel({
                name : profile.name.given_name,
                surname : profile.name.familyName || "not set",
                email : profile.emails[0].value,
                name : profile.name.givenName,
                avatar : profile.photos[0].value,
                googleId : profile.id
            })
            const savedAuthor = await newAuthor.save()
            const token = await authenticateAuthor(savedAuthor)
            console.log("new author saved and token is", token)
            passportNext(null,{token})
        }
    } catch (error) {
        console.log(error)
        }   
    }
)

passport.serializeUser((data, passportNext)=> {
    passportNext(null,data)
})

export default googleStrategy