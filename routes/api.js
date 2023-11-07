const route = require("express").Router();
const axios = require("axios");
const { v1: uuidv1 } = require("uuid");
const QRCode = require("qrcode");
const multer = require("multer");
const EventModel = require("../database/models/EventModel");
const SubmissionModel = require("../database/models/SubmissionModel");
const sendEmail = require("../utils/sendEmail");
const sendMessage = require("../utils/sms");
const path = require("path");
const UserConfig = require("../database/models/UserConfig");
const serialize = require("../utils/serialize");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Full __dirname includes /routes
    // Want to remove that

    // TODO: Change back to forward slash
    let dirnameSplit;
    let dirname;

    dirnameSplit = __dirname.split("/");
    dirnameSplit.pop();
    dirname = dirnameSplit.join("/");

    // if (process.env.NODE_ENV == "production") {
    //   dirnameSplit = __dirname.split("/");
    //   dirnameSplit.pop();
    //   dirname = dirnameSplit.join("/");
    // } else if (process.env.NODE_ENV == "development") {
    //   dirnameSplit = __dirname.split("\\");
    //   dirnameSplit.pop();
    //   dirname = dirnameSplit.join("\\");
    // }

    cb(null, path.join(dirname, "/public-images/"));
  },
  filename: (req, file, cb) => {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, Date.now() + "-" + uuidv1() + "." + extension);
  },
});

const upload = multer({ storage: storage });

route.get("/username/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await UserConfig.findById(userId);
  if (!user) return res.send({ username: null });
  return res.send({ username: user.username });
});

route.get("/user/:userId", async (req, res) => {
  if (!req.user) return res.send({ error: true, message: "Not logged in" });

  const id = req.params.userId;

  const User = await UserConfig.findById(id);
  if (!User)
    return res.send({ error: true, message: "No user with that id found" });

  return res.send({
    error: false,
    user: {
      username: User.username,
    },
  });
});

route.post("/user/general", async (req, res) => {
  const { username, name, email, phoneNumber, address } = req.body;
  let user = req.user;
  if (!user) return res.send({ error: true, message: "Not logged in" });

  const User = await UserConfig.findById(user.id);
  if (!User) return res.send({ error: true, message: "No user found" });

  if (!req.body)
    return res.send({ error: true, message: "No information sent" });

  if (!email)
    return res.send({ error: true, message: "Must provide an email" });
  if (!username)
    return res.send({ error: true, message: "Must provide a username" });

  if (username.length < 8)
    return res.send({
      error: true,
      message: "Username must be longer than 8 characters",
    });

  let userRegex = new RegExp(
    /^(?=.{8,20}$)(?![_. ])(?!.*[_.]{2})[a-zA-Z0-9._ ]+(?<![_. ])$/
  );
  if (!userRegex.test(username))
    return res.send({ error: true, message: "Invalid username" });

  let emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!emailRegex.test(email.toLowerCase()))
    return res.send({ error: true, message: "Invalid email" });

  let phoneRegex = new RegExp(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
  if (phoneNumber && !phoneRegex.test(phoneNumber))
    return res.send({ error: true, message: "Invalid phone number" });

  if (address.zip && (address.zip.length !== 5 || isNaN(parseInt(address.zip))))
    return res.send({ error: true, message: "Invalid ZIP Code" });

  const UserEmail = await UserConfig.findOne({ email });
  if (UserEmail && UserEmail.id != user.id)
    return res.send({
      error: true,
      message: "There is already a user with that email",
    });

  const UserPhone = await UserConfig.findOne({ phoneNumber });
  if (UserPhone && UserPhone.id != user.id)
    return res.send({
      error: true,
      message: "There is already a user with that phone number",
    });

  User.username = username;
  User.email = email;
  User.name = name;
  User.phoneNumber = phoneNumber;
  User.address = address;

  await User.save();

  return res.send({ errror: false, user: serialize.user(User) });
});

route.post("/update-event", async (req, res) => {
  let user = req.user;

  if (!user) return res.send({ error: true, message: "Not logged in" });

  const User = await UserConfig.findOne({ email: user.email });
  if (!User) return res.send({ error: true, message: "User not found" });

  let { event } = req.body;

  if (!event || !event.uuid)
    return res.send({ error: true, message: "Event is null" });

  const EventCreatedBy = (
    await EventModel.findOne({ uuid: event.uuid }, "createdBy")
  ).createdBy;

  if (!EventCreatedBy)
    return res.send({ error: true, message: "No event found" });

  if (EventCreatedBy.uuid != user.id)
    return res.send({
      error: true,
      message: "You are not the user who made this event",
    });

  await EventModel.deleteOne({ uuid: event.uuid });
  let newEvent = await EventModel.create({ ...event, lastUpdated: new Date() });

  return res.send({ error: false, event: newEvent });
});

route.delete("/event", async (req, res) => {
  let user = req.user;
  if (!user) return res.send({ error: true, message: "Not logged in" });

  const User = await UserConfig.findOne({ email: user.email });
  if (!User) return res.send({ error: true, message: "User not found" });

  let { eventUUID } = req.body;
  console.log(eventUUID);
  const EventCreatedBy = await EventModel.findOne(
    { uuid: eventUUID },
    "createdBy"
  );
  if (!EventCreatedBy)
    return res.send({ error: true, message: "Error not found" });

  if (EventCreatedBy?.createdBy?.uuid != user.id)
    return res.send({
      error: true,
      message: "You are not the user who made this event",
    });

  await EventModel.deleteOne({ uuid: eventUUID });
  return res.send({ error: false, success: true });
});

route.get("/image/:uuid", (req, res) => {
  let { uuid } = req.params;
  res.sendFile("./public-images/" + uuid, { root: "./" });
});

route.post("/testPhone", async (req, res) => {
  const { phoneNumber, phoneContent } = req.body;

  if (!phoneNumber)
    return res.send({ error: true, message: "Must include phone number" });

  sendMessage("Testing", phoneContent, "+1" + phoneNumber);

  return res.send({ error: false, message: "Text sent" });
});

route.post("/testEmail", async (req, res) => {
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

route.post("/submission/approve", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.send({ error: true, message: "No user id provided" });

  let submission = await SubmissionModel.findOne({ userUUID: userId });
  if (!submission)
    return res.send({ error: true, message: "No user with that id" });

  if (submission.prizeClaimed)
    return res.send({
      error: true,
      message: "Prize has already been claimed for this user",
    });

  let event = await EventModel.findOne({ uuid: submission.eventUUID });

  if (!event)
    return res.send({
      error: true,
      message: "The users event is no longer available",
    });

  if (event.maxCapacity) {
    if (event.currentCapacity >= event.maxCapacity)
      return res.send({
        error: true,
        message: "The event has reached maximum capacity",
      });

    event.currentCapacity = event.currentCapacity + 1;
    await event.save();
  }

  submission.prizeClaimed = true;
  submission.timePrizeClaimed = new Date();

  await submission.save();

  return res.send({ error: false, message: "QR Code Approved!" });
});

route.post("/image/upload", upload.single("image"), async (req, res) => {
  return res.send({ error: false, filename: req.file.filename });
});

route.post("/user/upload", upload.single("image"), async (req, res) => {
  if (!req.user) return res.send({ error: true, message: "Not logged in" });

  let User = await UserConfig.findById(req.user.id);
  if (!User) return res.send({ error: true, message: "No user found" });

  User.profileImagePath = req.file.filename;
  await User.save();

  return res.send({ error: false, filename: req.file.filename });
});

route.post("/event/create", upload.single("image"), async (req, res) => {
  let body = req.body;
  let uuid = uuidv1();
  let hasEnded = false;
  let currentCapacity = 0;
  let timeCreated = new Date();

  if (!body.maxCapacity) body.maxCapacity = 0;

  if (!body.companyName)
    return res.send({ error: true, message: "Company name is required" });

  let eventBody = {
    ...body,
    uuid,
    hasEnded,
    currentCapacity,
    timeCreated,
    fontColor: "#333333",
  };
  let event = await EventModel.create(eventBody);
  return res.send({ error: false, event });
});

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

route.get("/test", async (req, res) => {
  res.send({ success: true, body: req.body });
});

route.post("/qr", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.send({ error: true, message: "No qr code provided" });

  let qr = await QRCode.toDataURL(url);

  return res.send({ error: false, code: qr });
});

route.get("/event/:id", async (req, res) => {
  const { id } = req.params;

  let event = await EventModel.findOne({ uuid: id });
  if (!event)
    return res.send({
      error: true,
      message: "There does not exist an event with this id",
    });

  res.send({ error: false, event });
});

route.post("/event/submission/:id", async (req, res) => {
  const { id: eventId } = req.params;
  let { promotion, age, name, email, phone } = req.body;
  if (email) email = email.toLowerCase();

  let event = await EventModel.findOne({ uuid: eventId });
  if (!event)
    return res.send({
      error: true,
      message: "There does not exist an event with this id",
    });

  let fieldObject = {};

  if (
    event?.furtherContact?.toLowerCase() == "required" &&
    !!promotion == false
  ) {
    return res.send({
      error: true,
      message: "Promotion is required for this event",
    });
  }
  if (event.fields.email) {
    let emailReg = new RegExp(
      /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    );
    if (!emailReg.test(email))
      return res.send({
        error: true,
        message: "You must submit a valid email address",
      });

    let emailSubmission = await SubmissionModel.findOne({
      eventUUID: eventId,
      "fields.email": email,
    });

    if (emailSubmission)
      return res.send({
        error: true,
        message: "There already exists a submission with that email address",
      });

    fieldObject["email"] = email;
  }

  if (event.fields.phone) {
    let phoneReg = new RegExp(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
    );

    if (!phoneReg.test(phone))
      return res.send({
        error: true,
        message: "You must submit a valid phone number",
      });

    // Remove special character so someone can't save the same phone number twice
    let phone2 = phone.replace(/[^\w\s]/gi, "");
    if (phone2.split("")[0] == 1) {
      splitPhone = phone2.split("");
      splitPhone.shift();
      phone2 = splitPhone.join("");
    }
    phone = phone2;

    let phoneSubmission = await SubmissionModel.findOne({
      eventUUID: eventId,
      "fields.phone": phone,
    });

    if (phoneSubmission)
      return res.send({
        error: true,
        message: "There already exists a submission with that phone number",
      });

    fieldObject["phone"] = phone;
  }

  if (event.fields.age) {
    fieldObject["age"] = age;
  }

  if (event.fields.name) {
    if (!name)
      return res.send({ error: true, message: "A name must be provided" });

    fieldObject["name"] = name;
  }

  let userUUID = uuidv1();

  let submissionObject = {
    eventUUID: eventId,
    userUUID,
    timeSubmitted: Date.now(),
    prizeClaimed: false,
    fields: fieldObject,
    consent: !!promotion,
  };

  let user;
  try {
    user = await SubmissionModel.create(submissionObject);

    // TODO: Followup with twilio about being a business entity
    // if (phone) {
    //   const link = "https://qr-client.onrender.com/qrcode/" + encodeURIComponent("https://qr-client.onrender.com/redeem/"+user.userUUID);
    //   sendMessage(
    //     user.userUUID,
    //     event.text.phoneText ||
    //       `Press the following link to get your qr code for ${event.companyName}: ${link}`,
    //     "+1" + phone
    //   );
    // }

    if (email) {
      sendEmail({
        emailAddress: email,
        qrCodeId: user.userUUID,
        companyName: event.companyName,
        emailHTML: event.text.emailHTML,
      });
    }

    let user2 = { ...user };
    delete user2._doc.userUUID;

    return res.send({ error: false, user: user2 });
  } catch (err) {
    console.error("Error creating submission:", err);
    return res.send({
      error: true,
      message: "Submission unable to be created",
    });
  }
});

module.exports = route;
