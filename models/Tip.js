// // models/Tip.js
// const mongoose = require("mongoose");

// const TipSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   content: { type: String, required: true },
//   postedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   upVotes: { type: Number, default: 0 },
//   downVotes: { type: Number, default: 0 },
//   comments: [
//     {
//       user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       text: { type: String, required: true },
//       createdOn: { type: Date, default: Date.now },
//     },
//   ],
//   createdOn: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Tip", TipSchema);
const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  downVotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tip", tipSchema);
