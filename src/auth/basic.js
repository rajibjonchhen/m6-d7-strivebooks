import atob  from "atob"
import createError from "http-errors"

export const basicAuthMW  = (req, res, next) =>{

    if(!req.headers.authorization){
        next(createError(401, "Please provide credentials in Authorization header"))
    } else {
        const base64Credentials = req.headers.authorization.split(" ")[1]
        console.log(base64Credentials)
        const [email, password] = atob(base64Credentials).split(":")
        console.log(email, password)
    }
next()
}