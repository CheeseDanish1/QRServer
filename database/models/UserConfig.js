const mongoose = require("mongoose");

const UserConfig = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    profileImagePath: String,
  },
  { collection: "UserConfig", typeKey: "$type" }
);

module.exports = mongoose.model("UserConfig", UserConfig);
