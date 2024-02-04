const route = require("express").Router();
const { v1: uuidv1 } = require("uuid");
const EventModel = require("../../database/models/EventModel");
const SubmissionModel = require("../../database/models/SubmissionModel");
const { sendAnalytics } = require("../../utils/sendEmail");
const UserConfig = require("../../database/models/UserConfig");

route.post("/event/create", async (req, res) => {
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

// Get event from id
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

// Update event
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

// Delete Event
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

route.post("/event/analytics/send", async (req, res) => {
  const { eventId, email } = req.body;
  const user = req.user;
  if (!user) return res.send({ error: true, message: "Not authorized" });

  if (!email) return res.send({ error: true, message: "No email provided" });
  if (!eventId)
    return res.send({ error: true, message: "No event id provided" });

  let emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!emailRegex.test(email.toLowerCase()))
    return res.send({ error: true, message: "Invalid email" });

  const User = await UserConfig.findById(user.id);
  if (!User) return res.send({ error: true, message: "User not found" });

  const Event = await EventModel.findOne({ uuid: eventId });
  if (!Event) return res.send({ error: true, message: "Event not found" });

  const Submissions = await SubmissionModel.find({ eventUUID: eventId });

  sendAnalytics({ emailAddress: email, jsonData: Submissions, event: Event });

  res.send({ error: false, message: "Success" });
});

module.exports = route;
