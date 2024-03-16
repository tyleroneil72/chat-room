let ws;
let userName;
let currentRoom = null;

document.getElementById("joinBtn").addEventListener("click", () => joinRoom());
document.getElementById("generateBtn").addEventListener("click", generateCode);
document.getElementById("sendBtn").addEventListener("click", sendMessage);

function generateCode() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById("roomCode").value = code;
}

function joinRoom(roomCodeFromList = null) {
  userName = document.getElementById("userName").value.trim();
  let roomCode =
    roomCodeFromList || document.getElementById("roomCode").value.trim();
  if (!userName) {
    alert("Please enter your name.");
    return;
  }
  if (!roomCode) {
    alert("Please enter a room code.");
    return;
  }

  currentRoom = roomCode; // Set the current room

  const wsUrl = "ws://localhost:8080";
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = new WebSocket(wsUrl);
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({ action: "join", room: roomCode, user: userName }));
    updateRoomsList(); // Update rooms list after joining
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    displayMessage(message);
  };
}

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("You must join a room before sending a message.");
    return;
  }

  if (message) {
    ws.send(
      JSON.stringify({ action: "message", content: message, user: userName })
    );
    messageInput.value = "";
  }
}

function displayMessage(message) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  let messageClass = "other-message";
  if (message.user === userName) {
    messageClass = "own-message";
  } else if (message.user === "System") {
    messageClass = "system-message";
  }

  messageElement.innerHTML = `<span class="${messageClass}">${message.user}: ${message.content}</span>`;

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateRoomsList() {
  fetch("/rooms")
    .then((response) => response.json())
    .then((rooms) => {
      const roomsList = document.getElementById("roomsList");
      roomsList.innerHTML = ""; // Clear current list

      if (rooms.length === 0 || rooms.every((room) => room.count === 0)) {
        const li = document.createElement("li");
        li.textContent = "No active rooms";
        roomsList.appendChild(li);
      } else {
        rooms.forEach((room) => {
          const li = document.createElement("li");
          li.textContent = `${room.name} (${room.count} users)`;
          const joinButton = document.createElement("button");
          joinButton.textContent = "Join Room";
          joinButton.onclick = () => joinRoom(room.name);

          // Grey out the button if the user is already in the room
          if (currentRoom === room.name) {
            joinButton.disabled = true;
          } else {
            joinButton.disabled = false;
          }

          li.appendChild(joinButton);
          roomsList.appendChild(li);
        });
      }
    })
    .catch((error) => console.error("Error fetching rooms:", error));
}

setInterval(updateRoomsList, 3000); // Update every 3 seconds

document
  .getElementById("messageInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default action to stop from creating a new line
      sendMessage(); // Call the sendMessage function
    }
  });
