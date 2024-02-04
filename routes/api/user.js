const route = require("express").Router();
const UserConfig = require("../../database/models/UserConfig");
const serialize = require("../../utils/serialize");

route.get("/username/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await UserConfig.findById(userId);
  if (!user) return res.send({ username: null });
  return res.send({ username: user.username });
});

// Update settings
route.post("/user/general", async (req, res) => {
  const { username, name, email, phoneNumber, address } = req.body;
  let user = req.user;
  if (!user) return res.send({ error: true, message: "Not logged in" });

  const User = await UserConfig.findById(user.id);
  if (!User) return res.send({ error: true, message: "No user found" });

  if (!req.body)
    return res.send({ error: true, message: "No information sent" });

  if (!email)
    return res.send({ error: true, message: "Must provide an email" });
  if (!username)
    return res.send({ error: true, message: "Must provide a username" });

  if (username.length < 8)
    return res.send({
      error: true,
      message: "Username must be longer than 8 characters",
    });

  let userRegex = new RegExp(
    /^(?=.{8,20}$)(?![_. ])(?!.*[_.]{2})[a-zA-Z0-9._ ]+(?<![_. ])$/
  );
  if (!userRegex.test(username))
    return res.send({ error: true, message: "Invalid username" });

  let emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!emailRegex.test(email.toLowerCase()))
    return res.send({ error: true, message: "Invalid email" });

  let phoneRegex = new RegExp(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
  if (phoneNumber && !phoneRegex.test(phoneNumber))
    return res.send({ error: true, message: "Invalid phone number" });

  if (address.zip && (address.zip.length !== 5 || isNaN(parseInt(address.zip))))
    return res.send({ error: true, message: "Invalid ZIP Code" });

  const UserEmail = await UserConfig.findOne({ email });
  if (UserEmail && UserEmail.id != user.id)
    return res.send({
      error: true,
      message: "There is already a user with that email",
    });

  const UserPhone = await UserConfig.findOne({ phoneNumber });
  if (UserPhone && UserPhone.id != user.id)
    return res.send({
      error: true,
      message: "There is already a user with that phone number",
    });

  User.username = username;
  User.email = email;
  User.name = name;
  User.phoneNumber = phoneNumber;
  User.address = address;

  await User.save();

  return res.send({ errror: false, user: serialize.user(User) });
});

module.exports = route;
