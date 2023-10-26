const EventModel = require("../database/models/EventModel");

module.exports.user = async (user) => {
  if (!user) return null;

  let events = await EventModel.find(
    { createdBy: user._id },
    "uuid companyName"
  );

  return {
    username: user.username,
    email: user.email,
    events,
    id: user._id,
  };
};
