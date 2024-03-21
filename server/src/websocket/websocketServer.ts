import WebSocket, { WebSocketServer } from "ws";
import { WS_PORT } from "../config/ports";
import { broadcastMessage } from "../utils/broadcastMessage";
import { rooms } from "../models/Rooms";

export function setupWebSocketServer() {
  const wss: WebSocketServer = new WebSocket.Server({ port: WS_PORT });

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
          userName = parsedMessage.user ?? "Anonymous";
          currentRoom = parsedMessage.room ?? "defaultRoom";

          if (!rooms[currentRoom]) {
            rooms[currentRoom] = new Set();
          }
          rooms[currentRoom].add(ws);

          const joinMessage = {
            user: "System",
            content: `${userName} has joined the room.`,
          };
          broadcastMessage(currentRoom, joinMessage);

          ws.send(
            JSON.stringify({
              user: "System",
              content: `You joined ${currentRoom}.`,
            })
          );
          break;

        case "message":
          if (currentRoom) {
            broadcastMessage(currentRoom, {
              user: userName ?? "Anonymous",
              content: parsedMessage.content,
            });
          }
          break;
      }
    });

    ws.on("close", () => {
      if (currentRoom && rooms[currentRoom]) {
        rooms[currentRoom].delete(ws);
        if (rooms[currentRoom].size === 0) {
          delete rooms[currentRoom];
        } else if (userName) {
          broadcastMessage(currentRoom, {
            user: "System",
            content: `${userName} has left the room.`,
          });
        }
      }
    });
  });

  console.log(`WebSocket server started on port ${WS_PORT}`);
}
