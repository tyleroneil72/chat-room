const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};

function broadcastMessage(room, message) {
  if (rooms[room]) {
    rooms[room].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

wss.on("connection", function connection(ws) {
  let currentRoom = null;
  let userName = null;

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.action) {
      case "join":
        userName = parsedMessage.user;
        currentRoom = parsedMessage.room;

        if (!rooms[currentRoom]) {
          rooms[currentRoom] = new Set();
        }
        // Notify all clients in the room about the new user joining before adding the new user to the room
        const joinMessage = {
          user: "System",
          content: `${userName || "Someone"} has joined the room.`,
        };
        broadcastMessage(currentRoom, joinMessage);

        rooms[currentRoom].add(ws);

        ws.send(
          JSON.stringify({
            user: "System",
            content: `You joined ${currentRoom}.`,
          })
        );
        break;
      case "message":
        broadcastMessage(currentRoom, {
          user: userName || "Anonymous",
          content: parsedMessage.content,
        });
        break;
    }
  });

  ws.on("close", function () {
    if (rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) {
        delete rooms[currentRoom];
      } else {
        // Notify the room that the user has left
        broadcastMessage(currentRoom, {
          user: "System",
          content: `${userName || "Someone"} has left the room.`,
        });
      }
    }
  });
});

console.log("WebSocket server started on port 8080");
