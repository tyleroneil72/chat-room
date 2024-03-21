import WebSocket from "ws";

export interface Rooms {
  [key: string]: Set<WebSocket>;
}

export const rooms: Rooms = {};
