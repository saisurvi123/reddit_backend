const mongoose=require('mongoose')
const { Schema } = mongoose;

const reportSchema = new Schema({
  reportinguser:{
    type:String,
    required:true
  },
  reporteduser:{
    type:String,
    required:true,
    unique:true
  },
  concern:{
    type:String,
    required:true
  },
  greditid:{
    type:String,
    required:true
  },
  date:{
    type:String,
     default:Date.now
  },
  
});
module.exports=mongoose.model('report',reportSchema);