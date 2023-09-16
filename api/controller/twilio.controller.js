const { AccessToken, VideoGrant } = require('twilio').jwt;
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
} = process.env;

// Create the Twilio client
const twilioClient = require('twilio')(
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  {
    accountSid: TWILIO_ACCOUNT_SID,
  }
);

const generateToken = async (req, res) => {
  try {
    const { identity, roomName } = req.body;

    if (!identity || !roomName) {
      return res.status(400).json({ error: 'Identity and roomName are required.' });
    }

    // Create an access token with the VideoGrant
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET
    );

    // Set the identity of the token
    token.identity = identity;

    // Create a VideoGrant for the token
    const videoGrant = new VideoGrant({ room: roomName });

    // Add the VideoGrant to the token
    token.addGrant(videoGrant);

    // Serialize the token to a JWT and send it in the response
    const jwtToken = token.toJwt();
    res.json({ token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: 'Sorry, something went wrong.' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required.' });
    }

    try {
      // Check if the room exists by attempting to fetch it
      await twilioClient.video.rooms(roomName).fetch();
      // If the room exists, send a success response
      res.json({ message: 'Room exists.' });
    } catch (error) {
      // If the room does not exist (error code 20404), create it
      if (error.code === 20404) {
        await twilioClient.video.rooms.create({
          uniqueName: roomName,
          type: 'go', // Set the room type as needed
        });
        res.json({ message: 'Room created.' });
      } else {
        // Let other errors bubble up
        res.status(error.status || 500).json({ error: 'Sorry, something went wrong.' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Sorry, something went wrong.' });
  }
};

module.exports = { generateToken, joinRoom };
