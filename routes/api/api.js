const express = require("express");
const router = express.Router();

const captchaRoute = require("./captcha");
const eventRoute = require("./event");
const imageRoute = require("./image");
const submissionRoute = require("./submission");
const testRoute = require("./test");
const userRoute = require("./user");

router.use(captchaRoute);
router.use(eventRoute);
router.use(imageRoute);
router.use(submissionRoute);
router.use(testRoute);
router.use(userRoute);

module.exports = router;
