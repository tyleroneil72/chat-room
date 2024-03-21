import express, { Express, Request, Response } from "express";
import path from "path";
import WebSocket, { WebSocketServer } from "ws";

const app: Express = express();
const wss: WebSocketServer = new WebSocket.Server({ port: 8080 });
const HTTP_PORT: number = 3000;

app.use(express.static(path.join(__dirname, "../client")));

interface Rooms {
  [key: string]: Set<WebSocket>;
}

const rooms: Rooms = {};

function broadcastMessage(room: string, message: object): void {
  if (rooms[room]) {
    rooms[room].forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

wss.on("connection", (ws: WebSocket) => {
  let currentRoom: string | null = null;
  let userName: string | null = null;

  ws.on("message", (message: string) => {
    console.log("received: %s", message);

    const parsedMessage: {
      action: string;
      user?: string;
      room?: string;
      content?: string;
    } = JSON.parse(message);

    switch (parsedMessage.action) {
      case "join":
        userName = parsedMessage.user;
        currentRoom = parsedMessage.room;

        if (!rooms[currentRoom]) {
          rooms[currentRoom] = new Set();
        }
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

  ws.on("close", () => {
    if (rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      if (rooms[currentRoom].size === 0) {
        delete rooms[currentRoom];
      } else {
        broadcastMessage(currentRoom, {
          user: "System",
          content: `${userName || "Someone"} has left the room.`,
        });
      }
    }
  });
});

app.get("/rooms", (req: Request, res: Response) => {
  const roomList = Object.keys(rooms).map((room) => ({
    name: room,
    count: rooms[room].size,
  }));
  res.json(roomList);
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server started on port ${HTTP_PORT}`);
});

console.log("WebSocket server started on port 8080");
