const User=require('../models/userModel')

const filterObj =(obj , ...allowUpdates)=>{
    const newObj ={}
    Object.keys(obj).forEach((el)=>{
        if(allowUpdates.includes(el)) newObj[el] = obj[el]
    })
    return newObj   
}

exports.getAllUsers=async(req,res)=>{
   try {
       const users= await User.find()
       res.status(200).json({
        status: 'success',
        
        data:{
            users
        }

    })
   } catch (error) {
    res.status(404).json({
        status:"failed",
        messege:error
    })
   }
}
exports.deleteMe = async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})
    res.status(204).json({
        status:'success',
        data:null

    })
}

exports.updateMe=async (req,res,next)=>{
    // 1) Create Error If Users update password data
    if(req.body.password || req.body.passwordConfirm){
        return res.status(400).send('this route is not for password update . Please use /updatePassword route')
    }

    //2) Filtered out unwanted fields names that are not allowed to be updated
    const filterBody=filterObj(req.body,'name','email')

    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id , filterBody , {new:true,runValidators:true})
    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })
}


exports.getUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        messege:'this route not yet defined'
    })
}
exports.createUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        messege:'this route not yet defined'
    })
}
exports.updateUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        messege:'this route not yet defined'
    })
}
exports.deleteUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        messege:'this route not yet defined'
    })
}

