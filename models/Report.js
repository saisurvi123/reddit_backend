const mongoose=require('mongoose')
const { Schema } = mongoose;

const reportSchema = new Schema({
  reportinguser:{
    type:String,
  },
  reporteduser:{
    type:String,
  },
  concern:{
    type:String,
  },
  postid:{
    type:String,
  },
  gredditid:{
    type:String,
  },
  date:{
    type:String,
     default:Date.now
  },
  ignored:{
    type:Boolean,
    default:false
  },
  isblocked:{
    type:Boolean,
    default:false
  }
  
});
module.exports=mongoose.model('report',reportSchema);