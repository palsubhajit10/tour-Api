const util=require('util')
const User=require('../models/userModel')
const sendEmail=require('../utlis/email')
const jwt=require('jsonwebtoken')
const crypto = require('crypto')


const signToken=(id)=>{
    return jwt.sign({id:id},process.env.JWT_SECTET_KEY,{
        expiresIn:process.env.JWT_EXPIRE_TIME
})
}

const createSendToken = (user , statusCode , res) =>{
    const token=signToken(user._id)
       
    res.cookie('jwt',token,{
        expiresIn:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true,
        //secure:true
    })
    
    user.password=undefined
        res.status(statusCode).json({
            status: 'success',
            token,
            data: {
                user
            }
        })
}


exports.signUp= async(req,res)=>{
    try {
        const newUser= await User.create(req.body)
        createSendToken(newUser , 201 ,res)

    } catch (error) {
        res.status(400).json({
            status:"failed",
            messege:error.message
        })
    }
}

exports.login=async(req,res)=>{
   try {
    const {email,password}=req.body
    //1)check email and password  exist or not
    if(!email || !password){
        return res.status(400).send({
            status:'fail',
            messege:'please provide email and password'
        })
    }
    //2) check if user exist  && password is correct
    const user=await User.findOne({email:email}).select('+password')
    if(!user || !await user.correctPassword(password,user.password)){
        return res.status(401).send('incorrect email or password')
    }
  //console.log(user)
     createSendToken(user , 200 ,res)
   } catch (error) {
       res.status(400).json({
           status:'fail',
           messege:error
       })
   }
}

exports.protect=async(req,res,next)=>{
    try {
        // 1) GETTING TOKEN and checks its there
        let token;
        //console.log(req.headers)
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1]
            //console.log(token)
        }
        if(!token){
            return res.status(401).send('You are not logged in , please log in to get access')
        }
        //2) VERIFICATION TOKEN
        const decode=await util.promisify(jwt.verify)(token,process.env.JWT_SECTET_KEY)
        
        //3) check if users is still exist meand user account is present in db or not
        const freshUser=await User.findById(decode.id)
        if(!freshUser){
            return res.status(401).send('the user belongs to this token does no longer exist')
        }

       
        
        req.user=freshUser
        
    } catch (error) {
        res.send(error)
    }

    next()
}

exports.restrictTo = (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role))
        return res.status(403).send('you do not have permission to perform this action')
        next()
    }
}

exports.forgetPassword=async(req,res,next)=>{
// 1) get user based on postrd email
    const user=await User.findOne({email: req.body.email})
    if(!user){
        return res.status(404).send('there is no user with this email')
    }
    //2 )GENERATE the RANDOM RESET TOKEN
    const resetToken=user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})
     
    //3 ) send it to user email
    const resetUrl =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message=`Forget Your Password? submit a patch request with your new password and password
                 conform to: ${resetUrl}.\n if you didnot forget yous password please ignor this email`

    try {
        await sendEmail({
            email:user.email,
            subject:'Your password reset token valid for 10 min',
            message
        })
        res.status(200).json({
            status:'success',
            message:'Token sent to your email'
        })
    } catch (error) {
        user.passwordResetExpires=undefined,
        user.passwordResetToken=undefined,
        await user.save({validateBeforeSave:false})
        console.log(error)
        res.status(500).send(error)
    }
}

exports.resetPassword=async (req,res,next) =>{
   try {
        //1) Get User Based On Token
    const hashToken= crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken:hashToken, passwordResetExpires :{$gt : Date.now()}})

    //2) If Token is not Expired and there is a user , set the new password
    if(!user){
        return res.status(400).send('Token has expired or invalid')
    }
    user.password = req.body.password,
    user.passwordConfirm=req.body.passwordConfirm,
    user.passwordResetToken=undefined,
    user.passwordResetExpires=undefined,
    await user.save()

    //3) log in user and send jwt

    createSendToken(user , 200 ,res)

   } catch (error) {
       res.status(500).send(error.message)
   }
}

exports.updatePassword=async(req,res,next)=>{
    //1) Get user from collection
    const user=await User.findById(req.user.id).select('+password')

    //2)check posted current password is correct
    if(! await user.correctPassword(req.body.currentPassword,user.password)){
        return res.status(401).send('Your current password is worng')
    }

   try {
        //3) if so update password
    user.password=req.body.password,
    user.passwordConfirm=req.body.passwordConfirm
    await user.save()

    //4) log user in and send jwt
    createSendToken(user , 200 ,res)
   } catch (error) {
       res.status(500).send(error.message)
   }
}