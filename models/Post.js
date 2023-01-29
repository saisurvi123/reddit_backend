const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  postedby: {
    type: String,
    required: true,
  },
  gredditid: {
    type: String,
    required: true,
  },
  upvotes: [String],
  downvotes: [String],
  comments: [
    {
      username:String,
      userid: String,
      comment: String,
    },
  ],
  date: {
    type: String,
    default: Date.now,
  },
});
module.exports = mongoose.model("post", postSchema);
