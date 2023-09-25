document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById("room-name-form");
  const roomNameInput = document.getElementById("room-name-input");
  const container = document.getElementById("video-container");
  const declineButton = document.getElementById('decline-button');
  let room;

  // Function to handle joining a room
  async function startRoom(event) {
    event.preventDefault();
    form.style.visibility = "hidden";
    const roomName = roomNameInput.value.trim();

    const response = await fetch("/video/twilio/join-room", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName: roomName }),
    });
    const { token } = await response.json();

    room = await joinVideoRoom(roomName, token);

    // Show the "Decline" button when the call is active
    declineButton.style.display = 'block';

    // Render the local and remote participants' video and audio tracks
    handleConnectedParticipant(room.localParticipant);
    room.participants.forEach(handleConnectedParticipant);
    room.on("participantConnected", handleConnectedParticipant);

    // Handle cleanup when a participant disconnects
    room.on("participantDisconnected", handleDisconnectedParticipant);
    window.addEventListener("pagehide", () => room.disconnect());
    window.addEventListener("beforeunload", () => room.disconnect());
  }

  // Function to handle connected participants
  function handleConnectedParticipant(participant) {
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    container.appendChild(participantDiv);

    participant.tracks.forEach((trackPublication) => {
      handleTrackPublication(trackPublication, participant);
    });

    participant.on("trackPublished", handleTrackPublication);
  }

  // Function to handle track publications
  function handleTrackPublication(trackPublication, participant) {
    function displayTrack(track) {
      const participantDiv = document.getElementById(participant.identity);
      participantDiv.appendChild(track.attach());
    }

    if (trackPublication.track) {
      displayTrack(trackPublication.track);
    }

    trackPublication.on("subscribed", displayTrack);
  }

  // Function to handle disconnected participants
  function handleDisconnectedParticipant(participant) {
    participant.removeAllListeners();
    const participantDiv = document.getElementById(participant.identity);
    participantDiv.remove();
  }

  // Function to join the video room
  async function joinVideoRoom(roomName, token) {
    const room = await Twilio.Video.connect(token, {
      room: roomName,
    });
    return room;
  }

  // Functionality for the "Decline" button
  declineButton.addEventListener('click', function () {
    if (room) {
      room.disconnect(); // End the call when the "Decline" button is clicked
      declineButton.style.display = 'none'; // Hide the "Decline" button
    }
  });

  form.addEventListener("submit", startRoom);
});
