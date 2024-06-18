const mongoose = require("mongoose");

const UserConfig = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    profileImagePath: String,
    name: {
      first: String,
      last: String,
    },
    phoneNumber: String,
    address: {
      street: String,
      zip: String,
      city: String,
    },
    admin: Boolean,
  },
  { collection: "UserConfig", typeKey: "$type" }
);

module.exports = mongoose.model("UserConfig", UserConfig);
