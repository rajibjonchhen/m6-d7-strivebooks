import express, {Router} from "express";
import createError from "http-errors";

const usersRouter = Router()

/************************* post new *********************************/ 
usersRouter.post("/", async(req, res, next) => {try {
    
} catch (error) {
    next(error)
}})


/*************************** get all the *******************************/ 
usersRouter.get("/", async(req, res, next) => {try {
    if(true){

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})


/****************************** get specific ****************************/ 

usersRouter.get("/:id", async(req, res, next) => {try {
    
    if(true){

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})


/***************************** update specific *****************************/ 

usersRouter.put("/:id", async(req, res, next) => {try {
    
    if(true){

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})


/**************************** delete specific ******************************/ 

usersRouter.delete("/:id", async(req, res, next) => {try {
    
    if(true){

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})

export default usersRouter