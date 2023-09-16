const express = require('express');
const { generateToken, joinRoom } = require('../controller/twilio.controller');
const twilioRouter = express.Router();

twilioRouter.post('/generate-token', generateToken);
twilioRouter.post('/join-room', joinRoom);

module.exports = twilioRouter