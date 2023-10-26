const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_ADDRESS,
    pass: EMAIL_PASSWORD,
  },
});

async function sendEmail({ emailAddress, qrCodeId, companyName, emailHTML }) {
  if (!qrCodeId) return;
  if (!emailHTML) emailHTML = "";

  const APP_URL = "https://qr-client.onrender.com";
  const link = APP_URL + "/qrcode/";
  const qrCodeEncode = APP_URL + "/redeem/" + qrCodeId;
  const img = await QRCode.toDataURL(qrCodeEncode);

  const html =
    emailHTML +
    '<br/><img style="max-width: 100%; height: auto; display: block; margin: 20px auto" src="' +
    img +
    '"><br /><p>If the qr code is not loading <a href="' +
    link +
    encodeURIComponent(qrCodeEncode) +
    '">click here</a></p></div>';

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: emailAddress,
    subject: `QR Code From ${companyName}`, // Subject line
    // text: "You may get redeemed by having your qr code scanned", // plain text body
    html: html,
    attachDataUrls: true,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

sendEmail({ emailAddress: "pearlmans33737@gmail.com" });

module.exports = sendEmail;
