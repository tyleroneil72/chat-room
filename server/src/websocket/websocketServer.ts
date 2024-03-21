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
      const parsedMessage = JSON.parse(message);

      switch (parsedMessage.action) {
        case "join":
          userName = parsedMessage.user ?? "Anonymous";
          currentRoom = parsedMessage.room ?? "defaultRoom";

          if (currentRoom && !rooms[currentRoom]) {
            rooms[currentRoom] = new Set();
          }

          if (currentRoom) {
            rooms[currentRoom].add(ws);

            // Notify other users in the room
            broadcastMessage(
              currentRoom,
              {
                user: "System",
                content: `${userName} has joined the room.`,
              },
              ws
            ); // Exclude the sender from the broadcast

            // Direct message to the joining user
            ws.send(
              JSON.stringify({
                user: "System",
                content: `You joined ${currentRoom}.`,
              })
            );
          }
          break;

        case "message":
          if (currentRoom && rooms[currentRoom]) {
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
