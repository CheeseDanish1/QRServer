const router = require("express").Router();
const api = require("./api");
const auth = require("./auth");

router.get("/", (req, res) => {
  res.send({ status: "Success" });
});

router.use("/api", api);
router.use("/auth", auth);

module.exports = router;
