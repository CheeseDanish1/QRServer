const EventModel = require("../database/models/EventModel");

module.exports.user = async (user) => {
  if (!user) return null;

  // This is why the only fields are uuid and companyName
  let events = await EventModel.find(
    { "createdBy.uuid": user._id },
    "uuid companyName createdBy lastUpdated timeCreated"
  );

  return {
    username: user.username,
    email: user.email,
    profileImagePath: user.profileImagePath,
    events,
    id: user._id,
    phoneNumber: user.phoneNumber,
    address: user.address,
    name: user.name
  };
};
