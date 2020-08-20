const express=require('express')
const router=express.Router()


const authControler=require('../controller/authController')
const userController=require('../controller/userController')

router.route('/signup').post(authControler.signUp)
router.route('/login').post(authControler.login)
router.route('/forgetPassword').post(authControler.forgetPassword)
router.route('/resetPassword/:token').patch(authControler.resetPassword)
router.patch('/updateMyPassword',authControler.protect,authControler.updatePassword)
router.patch('/updateMe',authControler.protect,userController.updateMe)
router.delete('/deleteMe',authControler.protect,userController.deleteMe)


router.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)


module.exports=router
