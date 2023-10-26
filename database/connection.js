const mongoose = require("mongoose");
const uri = process.env.MONGO_URI_CONNECTION;

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("Connected to database"));

module.exports = db;
