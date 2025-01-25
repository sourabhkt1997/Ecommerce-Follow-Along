const express = require("express")
const app=express()
const {userRouter}=require("./routes/userRoute")
const cookieParser = require("cookie-parser");
app.use(cookieParser())
app.use(express.json())

app.use("/user",userRouter)

module.exports=app