const express = require('express');
const { generateToken, joinRoom } = require('../controller/twilio.controller');
const twilioRouter = express.Router();

twilioRouter.post('/twilio/generate-token', generateToken);
twilioRouter.post('/twilio/join-room', joinRoom);

module.exports = twilioRouter