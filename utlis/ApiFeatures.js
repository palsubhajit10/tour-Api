class ApiFeatures{
    constructor(mQuery,eQueryStrings)   //m-mongoose quary ,e-express(req.query) quary
    {
        this.query=mQuery
        this.queryStrings=eQueryStrings

    }
    filter(){
        //1A) Filtering
        const queryObj={  ...this.queryStrings }
        const excludedFields=['sort','page','fields','limit'];
        excludedFields.forEach(el=> delete queryObj[el])
        //1B) Advance Filtering
        let queryStr=JSON.stringify(queryObj)
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
        const queryParseObj=JSON.parse(queryStr)
       // console.log(queryParseObj) 

         this.query=this.query.find(queryParseObj)
         return this
    }
    sort(){
        if(this.queryStrings.sort){
            console.log(this.queryStrings.sort)
            const sortBy=this.queryStrings.sort.split(',').join(' ')
            this.query=this.query.sort(sortBy)
        }else{
            this.query=this.query.sort('-createdAt')
        }
        return this
    }
    fields(){
         //4)Fields that show
         if (this.queryStrings.fields) {
            const fields=this.queryStrings.fields.split(',').join(' ')
            this.query=this.query.select(fields)
        }else{
            this.query=this.query.select('-__v')
        }
        return this
    }
    pagination(){
        //Pagination
        const limit=parseInt(this.queryStrings.limit) ||100
        const page=parseInt(this.queryStrings.page) || 1 
        const skip=(page-1)*limit
        this.query=this.query.skip(skip).limit(limit)
        return this
    }
}

module.exports=ApiFeatures