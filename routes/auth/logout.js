const router = require("express").Router();
const COOKIE_NAME = "authorization";

router.post("/local/logout", async (req, res) => {
  if (!req.user) return res.send({ message: "Unauthorized" });

  res
    .status(200)
    .clearCookie(COOKIE_NAME)
    .send({ succuss: true, message: "Logout Success" });
});
module.exports = router;
