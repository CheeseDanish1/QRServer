const router = require("express").Router();
const User = require("../../database/models/UserConfig");

router.get("/local/user", async (req, res) => {
  let user = req.user;
  if (!user) return res.send({ user: null });

  // Check if user information is in database
  const databaseUser = await User.findOne({ email: user.email.toLowerCase() });
  if (!databaseUser) return res.send({ user: null });

  return res.send({ user });
});

module.exports = router;
