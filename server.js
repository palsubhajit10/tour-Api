const mongoose=require('mongoose')
const dotenv=require('dotenv')

const app=require('./app')
dotenv.config({path:'./config.env'})

const db=process.env.DATABASE

mongoose.connect(db,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then((con)=>{
   // console.log(con.connections)
    console.log('database connected....')
})


const port=process.env.PORT

app.listen(port,()=>{
    console.log(`server run on ${port} port`)
})
