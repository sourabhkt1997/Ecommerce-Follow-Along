const express=require("express")
const { userSignup ,userLogin,refreshToken,logOut,activation} = require("../controller/authController")
const userRouter=express.Router()


userRouter.post("/sign-up",userSignup)
userRouter.post("/log-in",userLogin)
userRouter.get("/refreshToken",refreshToken)
userRouter.get("/logout",logOut)
userRouter.get("/activation/:activationToken",activation)




module.exports={userRouter}


