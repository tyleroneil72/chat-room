import WebSocket from "ws";
import { rooms } from "../models/Rooms";

export function broadcastMessage(
  room: string,
  message: object,
  sender?: WebSocket
): void {
  if (rooms[room]) {
    rooms[room].forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
