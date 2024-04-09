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

async function sendAnalytics({ emailAddress, jsonData, event }) {
  let json = {
    data: jsonData.map((data) => {
      const obj = {
        eventUUID: data.eventUUID,
        timeSubmitted: data.timeSubmitted,
        prizeClaimedYet: data.prizeClaimed,
        consent: data.consent,
        fields: {},
      };
      return obj;
    }),
  };

  json.data.map((info, index) => {
    let obj = { ...info };
    if (event.fields.name) obj.fields["name"] = jsonData[index].fields.name;
    if (event.fields.age) obj.fields["age"] = jsonData[index].fields.age;
    if (event.fields.email) obj.fields["email"] = jsonData[index].fields.email;
    if (event.fields.phone) obj.fields["phone"] = jsonData[index].fields.phone;
    return obj;
  });

  // Chat gpt wrote this code
  let flattenedData = json.data.map((item) => ({
    ...item.fields,
    ...Object.fromEntries(
      Object.entries(item).filter(([key]) => key !== "fields")
    ),
  }));

  // This code also
  const csvContent = [
    Object.keys(flattenedData[0]).join(","),
    ...flattenedData.map((item) => Object.values(item).join(",")),
  ].join("\n");

  const html = `<div style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  <h1 style="color: #333;">Submission Report for ${event.companyName}</h1>
  <p style="color: #666;">Hello</p>
  <p style="color: #666;">We are pleased to share the latest information from our database with you. Please find the attached CSV file for your reference.</p>

  <p style="color: #666;">If you have any questions or need further assistance, feel free to<a href="mailto:pearlmans33737@gmail.com"> contact us</a></p>
</div>`;

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: emailAddress,
    subject: `Analytic Data`, // Subject line
    html: html,
    attachments: [
      // {
      //   filename: "analytics.json",
      //   content: JSON.stringify(json),
      //   contentType: "application/json",
      // },
      {
        filename: "analytics.csv",
        content: csvContent,
        contentType: "text/csv",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

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
    '"><br /><p>If the QR code is not loading <a href="' +
    link +
    encodeURIComponent(qrCodeEncode) +
    '">click here</a></p></div>';

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: emailAddress,
    subject: `QR Code From ${companyName}`, // Subject line
    // text: "You may get redeemed by having your QR code scanned", // plain text body
    html: html,
    attachDataUrls: true,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

module.exports = { sendEmail, sendAnalytics };
