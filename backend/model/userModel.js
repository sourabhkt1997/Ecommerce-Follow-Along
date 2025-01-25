const mongoose = require("mongoose")


const addressSchema= mongoose.Schema({
     country:{
        type:String,
        required:true
     },
     city:{
        type:String,
        required:true
     },
     pinCode:{
        type:Number,
        required:true
     },
     landMark:{
        type:String
     },
     phNo:{
        type:String,
        required:true
     },
     houseName:{
        type:String,
        required:true
     }
})

const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    address:[addressSchema],
    role:{
        type:String,
        default:"user"
    },
    avathar:{
        url:{
            type:String,
            default:"https://militaryhealthinstitute.org/wp-content/uploads/sites/37/2021/08/blank-profile-picture-png.png"
        }
    },
    activated:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
},{
     versionKey: false
    
})

const UserModel=mongoose.model("user",userSchema)

module.exports={UserModel}
