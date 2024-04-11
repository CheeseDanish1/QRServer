const router = require("express").Router();
const api = require("./api/api.js");
const auth = require("./auth/auth.js");

router.use("/api/auth", auth);
router.use("/api", api);

module.exports = router;
