import WebSocket from "ws";
import { rooms } from "../models/Rooms";

export function broadcastMessage(room: string, message: object): void {
  if (rooms[room]) {
    rooms[room].forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
