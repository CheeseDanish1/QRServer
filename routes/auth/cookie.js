const router = require("express").Router();
const COOKIE_NAME = "authorization";
const User = require("../../database/models/UserConfig");
const { encryptData } = require("../../utils/crypt");
const serialize = require("../../utils/serialize");

router.post("/local/cookie", async (req, res) => {
  if (!req.user) return res.send({ error: true, message: "Not logged in" });

  const user = {
    ...(await User.findById(req.user.id)),
  }._doc;
  const encryptedUser = encryptData(user, "1w");

  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2,
    })
    .send({
      user: await serialize.user(user),
      message: "Cookie updated!",
    });
});
module.exports = router;
