// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

const link = "https://qr-client.onrender.com/qrcode";

module.exports = function sendMessage(uuid, content, number) {
  client.messages
    .create({
      body: content,
      from: process.env.TWILIO_NUMBER,
      to: number,
      mediaUrl: `${link}/${encodeURIComponent(
        "https://qr-client.onrender.com/redeem/" + uuid
      )}`,
    })
    .then((message) => console.log("Message created", message, message.sid))
    .catch((e) => console.log(e));
};
