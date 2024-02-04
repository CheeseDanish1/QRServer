const route = require("express").Router();
const axios = require("axios");

route.post("/captcha", async (req, res) => {
  const { token } = req.body;

  try {
    // Sending secret key and response token to Google Recaptcha API for authentication.
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${token}`
    );
    res.send({ succuss: response.data.success });
  } catch (error) {
    // Handle any errors that occur during the reCAPTCHA verification process
    console.error(error);
    res.send({ error: true, message: "Error verifying reCAPTCHA" });
  }
});

module.exports = route;
