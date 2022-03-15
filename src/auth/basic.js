import atob  from "atob"
import createError from "http-errors"
import AuthorModel from  "../service/authors/author-schema.js"

export const basicAuthMW  = async(req, res, next) =>{

    if(!req.headers.authorization){
        next(createError(401, "Please provide credentials in Authorization header"))
    } else {
        const base64Credentials = req.headers.authorization.split(" ")[1]
        console.log(base64Credentials)
        const [email, password] = atob(base64Credentials).split(":")
        console.log(email, password)

        const author = await AuthorModel.checkCredentials(email, password)
        if(author){
            req.author = author
            next()
        } else {
            next(createError(401, "Credentials are not right"))
        }
    }
}