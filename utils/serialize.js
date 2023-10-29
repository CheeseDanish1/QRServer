const EventModel = require("../database/models/EventModel");

module.exports.user = async (user) => {
  if (!user) return null;

  // This is why the only fields are uuid and companyName
  let events = await EventModel.find(
    { createdBy: user._id },
    "uuid companyName createdBy lastUpdated timeCreated"
  );

  return {
    username: user.username,
    email: user.email,
    events,
    id: user._id,
  };
};
