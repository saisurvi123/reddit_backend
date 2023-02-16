const mongoose = require("mongoose");
const { Schema } = mongoose;

const subgredditSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  bannedkeywords: {
    type: [String],
    required: true,
  },
  followers: [
    {
      id: String,
      status: String,
      accepteddate: {
        type: String,
        default: "NA",
      },
      exiteddate: {
        type: String,
        default: "NA",
      },
      date: {
        type: String,
        default: Date.now,
      },
    },
  ],
  posts: {
    type: [String],
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: Date.now,
  },
  creationdate: {
    type: String,
  },
  visitors: [
    {
      date: {
        type: String,
        default: Date.now,
      },
    },
  ],
  reportcreations: [String],
  reportdeletions: [String],
});
module.exports = mongoose.model("subgreddit", subgredditSchema);
