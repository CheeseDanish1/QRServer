const EventModel = require("../database/models/EventModel");
const UserConfig = require("../database/models/UserConfig");

module.exports.user = async (user) => {
  if (!user) return null;

  let events = [];

  if (user.admin === true) {
    const Events = await EventModel.find();

    for (let i = 0; i < Events.length; i++) {
      let event = Events[i];
      let createdByUser = await UserConfig.findById(event.createdBy.uuid);
      if (createdByUser) {
        event.createdBy.username = createdByUser.username;
        events.push(event);
      }
    }
  } else {
    events = await EventModel.find(
      { "createdBy.uuid": user._id },
      "uuid companyName createdBy lastUpdated timeCreated archived"
    );
    events.forEach((_, i) => (events[i].createdBy.username = user.username));
  }
  // Remove this if event sharing becomes a thing

  return {
    username: user.username,
    email: user.email,
    profileImagePath: user.profileImagePath,
    events,
    id: user._id,
    phoneNumber: user.phoneNumber,
    address: user.address,
    name: user.name,
  };
};
