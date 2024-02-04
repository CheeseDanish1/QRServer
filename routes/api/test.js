const route = require("express").Router();
const { sendEmail } = require("../../utils/sendEmail");
const sendMessage = require("../../utils/sms");

route.post("/test/phone", async (req, res) => {
  const { phoneNumber, phoneContent } = req.body;

  if (!phoneNumber)
    return res.send({ error: true, message: "Must include phone number" });

  sendMessage("Testing", phoneContent, "+1" + phoneNumber);

  return res.send({ error: false, message: "Text sent" });
});

// Send test email
route.post("/test/email", async (req, res) => {
  const { emailHTML, emailAddress } = req.body;

  if (!emailAddress)
    return res.send({ error: true, message: "Must include email address" });

  sendEmail({
    emailAddress,
    emailHTML,
    qrCodeId: "Testing",
    companyName: "Testing",
  });

  return res.send({ error: false, message: "Email sent" });
});

module.exports = route;
