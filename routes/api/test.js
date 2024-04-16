const route = require("express").Router();
const { sendEmail } = require("../../utils/sendEmail");
const sendMessage = require("../../utils/sms");

route.post("/test/phone", async (req, res) => {
  const { messageContent, number } = req.body;

  // TODO: Validate phone number

  if (!number)
    return res.send({ error: true, message: "Must include phone number" });

  try {
    sendMessage({
      content: messageContent,
      number: "+1" + number,
      userUUID: "demonstration-only",
    });
  } catch (error) {
    console.error(error);
    return res.send({ error: true, message: "An unknown error has occurred" });
  }

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
