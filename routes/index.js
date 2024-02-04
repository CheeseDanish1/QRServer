const router = require("express").Router();
const api = require("./api/api.js");
const auth = require("./auth/auth.js");

router.use("/api", api);
router.use("/auth", auth);

module.exports = router;
