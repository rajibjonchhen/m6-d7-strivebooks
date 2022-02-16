import express, {Router} from "express";
import createError from "http-errors";
import blogsModel from "./user-schema.js"
const blogsRouter = Router()

/************************* post new *********************************/ 
blogsRouter.post("/", async(req, res, next) => 
{try {
    const newBlog = new blogsModel(req.body)
    const {_id} = await newBlog.save()
    res.status(201).send({_id:_id})
} catch (error) {
    next(error)
}})


/*************************** get all the *******************************/ 
blogsRouter.get("/", async(req, res, next) => 
{
    try {
   const blogs = await blogsModel.find()
   res.status(200).send(blogs)

} catch (error) {
    next(error)
}})


/****************************** get specific ****************************/ 

blogsRouter.get("/:blogId", async(req, res, next) => 
{
    try {
        const blogId = req.params.blogId
        const blog = await blogsModel.findById(blogId)
        res.status(200).send(blog)

    if(true){

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})


/***************************** update specific *****************************/ 

blogsRouter.put("/:blogId", async(req, res, next) => 
{
    try {
        const blogId = req.params.blogId
        const updatedBlog = await blogsModel.findByIdAndUpdate(blogId, req.body,{new : true,})
    if(updatedBlog){

        res.status(200).send(updatedBlog)

    }else{
        next(createError(404, "could not find the specific "))
    }
} catch (error) {
    next(error)
}})


/**************************** delete specific ******************************/ 

blogsRouter.delete("/:blogId", async(req, res, next) => {try {
    const blogId = req.params.blogId
    const deletedBlog = await blogsModel.findByIdAndDelete(blogId)
    if(deletedBlog){
        res.status(204).send()
    }else{
        next(createError(404, "could not find the specific blog with id",blogId))
    }
} catch (error) {
    next(error)
}})

export default blogsRouter