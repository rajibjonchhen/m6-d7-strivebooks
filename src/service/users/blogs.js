import express, {Router} from "express";
import createError from "http-errors";
import blogsModel from "./blog-schema.js"
import q2m from "query-to-mongo";
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
        const mongoQuery = q2m(req.query)
        const total = await blogsModel.countDocuments(mongoQuery.criteria)
    if(req.query){       
        const blogs = await blogsModel.find(mongoQuery.criteria).sort(mongoQuery.options.sort).skip(mongoQuery.options.skip).limit(mongoQuery.options.limit)
        res.status(200).send({
            links : mongoQuery.links("/blogs", total),
            total,
            totalPages : Math.ceil(total/mongoQuery.options.limit),
            blogs})
    } else{
        const blogs = await blogsModel.find()
        res.status(200).send(blogs)
    }
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

/**************************** delete specific ******************************/ 
blogsRouter.post("/blogId/reviews", async(req, res, next) => {
try {
    const blogId =  req.params.blogId
    const newReview = {...req.body}
    const blog = await blogsModel.findById(blogId)
    if(blog){
        const modifiedBlog = await blogsModel.findByIdAndUpdate(
            blogId,
            {$push: {reviews : newReview}},
            {new : true}
        ) 
    }else{
        next(createError(404, "could not find the specific blog with id",blogId))

    }
} catch (error) {
    next(error)
    
}
})

export default blogsRouter