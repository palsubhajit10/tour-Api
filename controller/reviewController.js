
const Review = require('../models/reviewModel')
exports.createReview = async (req,res)=>{
    try {
        const review =await Review.create(req.body)
        res.status(201).json({
            status:'success',
            data:{
                review
            }
        })
    } catch (error) {
        res.status(400).json({
            status:"failed",
            messege:error.message
        })
    }
}
exports.getAllReview = async (req,res)=>{
    try {
        const review =await Review.find()
        res.status(200).json({
            status:'success',
            data:{
                review
            }
        })
    } catch (error) {
        res.status(500).json({
            status:"failed",
            messege:error.message
        })
    }
}