const mongoose=require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstname:{
    type:String,
    required:true
  },
  lastname:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  age:{
    type:String,
    required:true
  },
  contactnumber:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  date:{
    type:String,
     default:Date.now
  },
  verified:{
    type:Boolean
  },
  followers:{
    type:[String],
    required:true
  },
  following:{
    type:[String],
    required:true
  },
  followinggreddits:[
    {
      id:String,
      status:String,
      date: {
        type: String,
        default: Date.now,
      },
    }
  ],
  savedposts:[String]
  
});
module.exports=mongoose.model('user',UserSchema);