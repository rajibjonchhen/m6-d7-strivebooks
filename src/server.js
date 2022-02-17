import express from "express";
import mongoose  from "mongoose";
import listEndpoints from 'express-list-endpoints'
import blogsRouter from "./service/blogs/blogs.js";
import authorsRouter from "./service/authors/authors.js";
import cors from 'cors'
import { badRequestHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler } from "./service/blogs/errorHandler.js";
const {PORT = 3001} = process.env

const server = express()

server.use(cors())
server.use(express.json())

server.use("/blogs", blogsRouter)
server.use("/authors", authorsRouter)

mongoose.connect(process.env.Mongo_Connection)
mongoose.connection.on("connected", () => {
    console.log("successfully connected to  mongo!")
})



server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(PORT, () => {
    console.table(listEndpoints(server))
    console.log("The server is running in port", PORT)
})

server.on("error", (error) => {
    console.log("server has stopped  ",error)
})