const route = require("express").Router();
const { v1: uuidv1 } = require("uuid");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Full __dirname includes /routes
    // Want to remove that

    let dirnameSplit;
    let dirname;

    dirnameSplit = __dirname.split("/");
    dirnameSplit.pop();
    dirname = dirnameSplit.join("/");

    // if (process.env.NODE_ENV == "production") {
    //   dirnameSplit = __dirname.split("/");
    //   dirnameSplit.pop();
    //   dirname = dirnameSplit.join("/");
    // } else if (process.env.NODE_ENV == "development") {
    // dirnameSplit = __dirname.split("\\");
    // dirnameSplit.pop();
    // dirname = dirnameSplit.join("\\");
    // }

    console.log(path.join(dirname, "../public-images/"));

    cb(null, path.join(dirname, "../public-images/"));
  },
  filename: (req, file, cb) => {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    let id = uuidv1();
    let name = Date.now() + "-" + id + "." + extension;
    console.log(name);
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

route.post("/image/upload", upload.single("image"), async (req, res) => {
  return res.send({ error: false, filename: req.file.filename });
});

// // Return image
route.get("/image/:uuid", (req, res) => {
  let { uuid } = req.params;
  res.sendFile("./public-images/" + uuid, { root: "./" });
});

route.post("/user/upload", upload.single("image"), async (req, res) => {
  if (!req.user) return res.send({ error: true, message: "Not logged in" });

  let User = await UserConfig.findById(req.user.id);
  if (!User) return res.send({ error: true, message: "No user found" });

  User.profileImagePath = req.file.filename;
  await User.save();

  return res.send({ error: false, filename: req.file.filename });
});
module.exports = route;
