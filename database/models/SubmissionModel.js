const mongoose = require("mongoose");

const SubmissionConfig = new mongoose.Schema(
  {
    eventUUID: String,
    userUUID: String,
    timeSubmitted: String,
    prizeClaimed: Boolean,
    timePrizeClaimed: Date,
    fields: {
      name: String,
      email: String,
      phone: String,
      age: Date,
    },
    consent: Boolean,
  },
  { collection: "Submissions", typeKey: "$type" }
);

module.exports = mongoose.model("Submissions", SubmissionConfig);
