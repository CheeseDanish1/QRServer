const mongoose = require("mongoose");

const EventConfig = new mongoose.Schema(
  {
    uuid: String,
    createdBy: String,
    companyName: String,
    startTime: Date,
    endTime: Date,
    hasEnded: Boolean,
    // 0 for no max capacity
    maxCapacity: Number,
    // Doesn't increment if maxCapacity is 0
    currentCapacity: Number,
    timeCreated: Date,
    // "None", "Required", "Optional"
    furtherContact: String,
    fields: {
      name: Boolean,
      email: Boolean,
      phone: Boolean,
      age: Boolean,
    },
    text: {
      phoneText: String,
      emailHTML: String,
      eventLandingText: String,
    },
    enabled: {
      image: Boolean,
      maxCapacity: Boolean,
    },
    fontColor: String,
    imagePath: String,
  },
  { collection: "Events", typeKey: "$type" }
);

module.exports = mongoose.model("Event", EventConfig);
