const mongoose=require('mongoose');
// const mongoURI="mongodb://localhost:27017/Reddit";
const mongoURI="mongodb+srv://greddit:saikiran@cluster0.vutilli.mongodb.net/?retryWrites=true"
// this is how we connect to mongo
const connectToMongo=()=>{
    mongoose.connect(mongoURI).then(()=>{
        console.log("connected to db")
    }).catch((err)=>{
        console.log("unable to connect");
        console.log(err)
    })
}

module.exports= connectToMongo;