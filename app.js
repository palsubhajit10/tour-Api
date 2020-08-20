const express=require('express')
const bodyParser = require('body-parser')
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const app=express()

app.use(helmet())  //set security http header
app.use(bodyParser.json())

app.use(mongoSanitize())  //datasanitization against nosql query injection
const tourRouter=require('./routes/tourRouters')
const userRouter=require('./routes/userRouter')
const reviewRouter=require('./routes/reviewRouter')



app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)


app.all('*',(req,res)=>{
     res.status(404).json({
        status:'fail',
         message:`can not find ${req.originalUrl} on the server`
     })
    
})


module.exports=app