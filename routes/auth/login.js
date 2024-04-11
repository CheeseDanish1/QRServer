const router = require("express").Router();
const COOKIE_NAME = "authorization";
const User = require("../../database/models/UserConfig");
const serialize = require("../../utils/serialize");
const { encryptData, decrypt } = require("../../utils/crypt");

router.post("/local/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(200).send({
      message: "You must provide an email and a password",
      error: true,
    });
  const oldUser = await User.findOne({ email });
  if (!oldUser)
    return res.status(200).send({ error: true, message: "User not found" });

  const decryptedPass = decrypt(oldUser.password).toString();
  if (decryptedPass != password) {
    return res.send({ message: "Incorect password", error: true });
  }

  const encryptedUser = encryptData({ ...oldUser }._doc, "1w");
  const user = await serialize.user(oldUser);

  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2,
    })
    .setHeader(COOKIE_NAME, encryptedUser)
    .send({
      message: "Successfully logged in!",
      user,
    });
});
module.exports = router;
