const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

module.exports = function sendMessage({ content, number, link }) {
  client.messages
    .create({
      body: content,
      from: process.env.TWILIO_NUMBER,
      to: number,
      mediaUrl: [link],
    })
    .then((message) => console.log("Message created", message, message.sid))
    .catch((e) => console.log(e));
};
