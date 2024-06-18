const route = require("express").Router();
const { v1: uuidv1 } = require("uuid");
const EventModel = require("../../database/models/EventModel");
const SubmissionModel = require("../../database/models/SubmissionModel");
const { sendEmail } = require("../../utils/sendEmail");
const sendMessage = require("../../utils/sms");
const phoneUtil =
  require("google-libphonenumber").PhoneNumberUtil.getInstance();
// const APP_URI = process.env.APP_URI;

route.post("/submission/approve", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.send({ error: true, message: "No user id provided" });

  let submission = await SubmissionModel.findOne({ userUUID: userId });
  if (!submission)
    return res.send({ error: true, message: "No user with that id" });

  if (submission.prizeClaimed)
    return res.send({
      error: true,
      message: "This QR Code has already been redeemed.",
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

  let message = "QR Code Approved!";

  return res.send({ error: false, message: message });
});

route.get("/submissions/:eventId", async (req, res) => {
  const id = req.params.eventId;

  if (!req.user) return res.send({ error: true, message: "Unauthorized" });

  const Event = await EventModel.findOne({ uuid: id });

  if (!Event)
    return res.send({ error: true, message: "No event with that id found" });

  if (Event.createdBy.uuid != req.user.id && req.user.admin == false)
    return res.send({
      error: true,
      message: "You are not the creator of this event",
    });

  const Submissions = await SubmissionModel.find({ eventUUID: id });

  return res.send({ error: false, submissions: Submissions, event: Event });
});

// Create a submission for an event
route.post("/submission/:id/create", async (req, res) => {
  const { id: eventId } = req.params;
  let { promotion, age, name, email, phone, custom } = req.body;

  if (email) email = email.toLowerCase();

  let event = await EventModel.findOne({ uuid: eventId });
  if (!event)
    return res.send({
      error: true,
      message: "There does not exist an event with this id",
    });

  if (!event.furtherContact) event.furtherContact = "none";

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
    const number = phoneUtil.parseAndKeepRawInput(phone, "US");

    if (!phoneUtil.isValidNumber(number))
      return res.send({
        error: true,
        message: "You must submit a valid phone number",
      });

    if (!phoneUtil.isValidNumberForRegion(number, "US"))
      return res.send({
        error: true,
        message: "You may only use a US phone number",
      });

    // Remove special character so someone can't save the same phone number twice

    phone = number.getNationalNumber();
    console.log(phone);

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

  // Remove this from later code
  if (custom) {
    fieldObject["custom"] = [];
    custom.forEach((c) => {
      fieldObject["custom"].push(c);
    });
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
    if (phone) {
      let uuid = user.userUUID;

      sendMessage({
        content:
          event.text.phoneText ||
          `Get your QR code scanned to redeem your free gift!`,
        userUUID: uuid,
        number: "+1" + phone,
      });
    }

    if (email && !phone) {
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
