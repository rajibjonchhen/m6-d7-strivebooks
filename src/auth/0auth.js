import passport from 'passport'
import GoogleStrategy from "passport-google-oauth20"

const googleStrategy = new GoogleStrategy({
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL:`${process.env.API_URL}/authors/googleRedirect`
},
(accessToken, refreshToken, profile, cb) => {
    console.log(profile);
}
)

export default googleStrategy