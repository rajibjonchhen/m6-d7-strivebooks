import express from "express";
import mongoose  from "mongoose";
import listEndpoints from 'express-list-endpoints'
import blogsRouter from "./service/blogs/blogs.js";
import authorsRouter from "./service/authors/authors.js";
import cors from 'cors'
import { badRequestHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler, forbiddenHandler } from "./service/errorHandler/errorHandler.js";
import passport from "passport"
import googleStrategy from './auth/0auth.js'
const {PORT = 3001} = process.env

const server = express()

passport.use("google", googleStrategy)

server.use(cors())
server.use(express.json())
server.use(passport.initialize())

server.use("/blogs", blogsRouter)
server.use("/authors", authorsRouter)



/************************** Error Handler ****************************/
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(forbiddenHandler)
server.use(genericErrorHandler)


mongoose.connect(process.env.Mongo_Connection)
mongoose.connection.on("connected", () => {
    console.log("successfully connected to  mongo!")
    server.listen(PORT, () => {
        console.table(listEndpoints(server))
        console.log("The server is running in port", PORT)
    })
})

server.on("error", (error) => {
    console.log("server has stopped  ",error)
})