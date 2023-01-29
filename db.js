const mongoose=require('mongoose');
// const mongoURI="mongodb://localhost:27017/Reddit";
const mongoURI="mongodb+srv://greddit:saikiran@cluster0.vutilli.mongodb.net/?retryWrites=true&w=majority"
// this is how we connect to mongo
const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("connected to database");
    })
}

module.exports= connectToMongo;