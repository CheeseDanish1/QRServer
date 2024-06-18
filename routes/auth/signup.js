const router = require("express").Router();
const COOKIE_NAME = "authorization";
const User = require("../../database/models/UserConfig");
const { encrypt, encryptData } = require("../../utils/crypt");
const serialize = require("../../utils/serialize");

router.post("/local/signup", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email)
    return res.status(200).send({
      message: "You must provide all requested information",
      error: true,
    });

  let lengthRegex = new RegExp("^(?=.{8,20}$)");
  if (!lengthRegex.test(username)) {
    return res.status(200).send({
      message: "Username must be 8-20 characters",
      error: true,
    });
  }

  let userRegex = new RegExp(
    "^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$"
  );
  if (!userRegex.test(username)) {
    return res.status(200).send({
      message: "Invalid Username",
      error: true,
    });
  }

  let emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!emailRegex.test(email.toLowerCase())) {
    return res.status(200).send({
      message: "You must provide a valid email",
      error: true,
    });
  }

  const oldUser = await User.findOne({ username });
  if (oldUser)
    return res
      .status(200)
      .send({ error: true, message: "The username already exists" });
  const oldUser2 = await User.findOne({ email });
  if (oldUser2)
    return res
      .status(200)
      .send({ error: true, message: "That email is already in use" });
  const encryptedPassword = encrypt(password);
  const user = {
    ...(await User.create({
      username,
      password: encryptedPassword,
      email,
      admin: false,
    })),
  }._doc;
  const encryptedUser = encryptData(user, "1w");
  // Expires in 2 week
  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2,
    })
    .send({
      user: await serialize.user(user),
      message: "Successfully signed up!",
    });
});
module.exports = router;
