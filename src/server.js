import express from "express";
import mongoose  from "mongoose";
import listEndpoints from 'express-list-endpoints'
import blogsRouter from "./service/users/blogs.js";
import cors from 'cors'
const {PORT = 3001} = process.env

const server = express()

server.use(cors())
server.use(express.json())

server.use("/blogs", blogsRouter)

mongoose.connect(process.env.Mongo_Connection)
mongoose.connection.on("connected", () => {
    console.log("successfully connected to  mongo!")
})

server.listen(PORT, () => {
    console.table(listEndpoints(server))
    console.log("The server is running in port", PORT)
})

server.on("error", (error) => {
    console.log("server has stopped  ",error)
})