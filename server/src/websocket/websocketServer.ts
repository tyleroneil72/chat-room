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
          const newRoom = parsedMessage.room ?? "defaultRoom";

          // Leave the previous room if different
          if (currentRoom && rooms[currentRoom] && currentRoom !== newRoom) {
            rooms[currentRoom].delete(ws);
            if (rooms[currentRoom].size === 0) {
              delete rooms[currentRoom];
            } else {
              broadcastMessage(currentRoom, {
                user: "System",
                content: `${userName} has left the room.`,
              });
            }
          }

          currentRoom = newRoom;
          if (currentRoom) {
            rooms[currentRoom] = rooms[currentRoom] || new Set();
            rooms[currentRoom].add(ws);

            broadcastMessage(
              currentRoom,
              {
                user: "System",
                content: `${userName} has joined the room.`,
              },
              ws
            );

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

        case "leave":
          if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].delete(ws);
            broadcastMessage(currentRoom, {
              user: "System",
              content: `${userName} has left the room.`,
            });

            if (rooms[currentRoom].size === 0) {
              delete rooms[currentRoom];
            }

            currentRoom = null;
            userName = null;
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

        currentRoom = null;
        userName = null;
      }
    });
  });

  // console.log(`WebSocket server started on http://localhost:${WS_PORT}`);
}
