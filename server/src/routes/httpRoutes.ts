import { Express } from "express";
import { rooms } from "../models/Rooms";

export function registerHttpRoutes(app: Express) {
  app.get("/rooms", (req, res) => {
    const roomList = Object.keys(rooms).map((room) => ({
      name: room,
      count: rooms[room].size,
    }));
    res.json(roomList);
  });
}
