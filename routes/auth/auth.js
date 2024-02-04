const userRoute = require("./user");
const signupRoute = require("./signup");
const cookieRoute = require("./cookie");
const logoutRoute = require("./logout");
const loginRoute = require("./login");

const router = require("express").Router();

router.use(userRoute);
router.use(signupRoute);
router.use(cookieRoute);
router.use(logoutRoute);
router.use(loginRoute);

module.exports = router;
