// twilio.controller.js

const { v4: uuidv4 } = require("uuid");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const twilioClient = require("twilio")(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

const findOrCreateRoom = async (roomName) => {
  try {
    // See if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.rooms(roomName).fetch();
  } catch (error) {
    // The room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: "go",
      });
    } else {
      // Let other errors bubble up
      throw error;
    }
  }
};

const generateToken = (req, res) => {
  // Generate an Access Token for a participant in a room
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }

  const roomName = req.body.roomName;
  findOrCreateRoom(roomName);

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { identity: uuidv4() }
  );

  const videoGrant = new VideoGrant({
    room: roomName,
  });

  token.addGrant(videoGrant);

  res.send({
    token: token.toJwt(),
  });
};

const joinRoom = async (req, res) => {
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }

  const roomName = req.body.roomName;

  try {
    // Check if the room exists. If not, create it.
    await findOrCreateRoom(roomName);

    // Generate an Access Token for the participant
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: uuidv4() }
    );

    const videoGrant = new VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);

    res.send({
      token: token.toJwt(),
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).send("Error joining room.");
  }
};

module.exports = {
  generateToken,
  joinRoom,
};
