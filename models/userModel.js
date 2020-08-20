const mongoose=require('mongoose')
const crypto = require('crypto')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell your name'],
        trim:true,

    },
    role:{
        type:String,
        enum:['admin','lead-guide','guide','user'],
        default:'user'
    },
    email:{
        type:String,
        required:[true,'please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid email']
        
    },
    photo:{
        type:String
    },
    password:{
        type:String,
        required:[true,'please enter your password'],
        minlength:8,
        select:false
        
    },
    passwordConfirm:{
        type:String,
        required:[true,'please confirm your password'],
        validate:{
            //this is only worn on .create or .save
            validator:function(val){
                return val===this.password
            },
            message:'passwords are not same'
        }
    },
   
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()
     this.password=await bcrypt.hash(this.password,10)

     this.passwordConfirm=undefined
     next()
})

userSchema.methods.correctPassword=async function(loginPassword,actualPassword){
    return await bcrypt.compare(loginPassword,actualPassword)
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')
    //console.log(resetToken,this.passwordResetToken)
    this.passwordResetExpires=Date.now() + 10*60*1000

    return resetToken
}

userSchema.pre(/^find/ ,function(next){
    //this will  give result which activenot equal to false
    this.find({active : {$ne:false}})
    next()
})

const User=mongoose.model('User',userSchema)
module.exports=User