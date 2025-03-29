const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: { type: String, required: false, default: "Pending" },
  verifiedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ], // Array of verifiers

  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
