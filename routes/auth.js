const router = require("express").Router();
const User = require("../database/models/UserConfig");
const { encrypt, encryptData, decrypt } = require("../utils/crypt");
const serialize = require("../utils/serialize");
const COOKIE_NAME = "authorization";

router.get("/local/user", async (req, res) => {
  let user = req.user;
  if (!user) return res.send({ user: null });

  // Check if user information is in database
  const databaseUser = await User.findOne({ email: user.email.toLowerCase() });
  if (!databaseUser) return res.send({ user: null });

  return res.send({ user });
});

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
    })),
  }._doc;
  const encryptedUser = encryptData(user, "1w");
  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, { httpOnly: true })
    .send({
      user: await serialize.user(user),
      message: "Successfully signed up!",
    });
});

router.post("/local/cookie", async (req, res) => {
  if (!req.user) return res.send({ error: true, message: "Not logged in" });

  const user = {
    ...(await User.findById(req.user.id)),
  }._doc;
  const encryptedUser = encryptData(user, "1w");

  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, { httpOnly: true })
    .send({
      user: await serialize.user(user),
      message: "Cookie updated!",
    });
});

router.post("/local/logout", async (req, res) => {
  if (!req.user) return res.send({ message: "Unauthorized" });

  res
    .status(200)
    .clearCookie(COOKIE_NAME)
    .send({ succuss: true, message: "Logout Success" });
});

router.post("/local/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(200).send({
      message: "You must provide an email and a password",
      error: true,
    });
  const oldUser = await User.findOne({ email });
  if (!oldUser)
    return res
      .status(200)
      .send({ error: true, message: "Could not find user" });

  const decryptedPass = decrypt(oldUser.password).toString();
  if (decryptedPass != password) {
    return res.send({ message: "Incorect password", error: true });
  }

  const encryptedUser = encryptData({ ...oldUser }._doc, "1w");
  const user = await serialize.user(oldUser);

  return res
    .status(200)
    .cookie(COOKIE_NAME, encryptedUser, { httpOnly: true })
    .setHeader(COOKIE_NAME, encryptedUser)
    .send({
      message: "Successfully logged in!",
      user,
    });
});

module.exports = router;
