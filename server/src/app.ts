import express, { Express } from "express";
import path from "path";
import { HTTP_PORT } from "./config/ports";
import { setupWebSocketServer } from "./websocket/websocketServer";
import { registerHttpRoutes } from "./routes/httpRoutes";

const app: Express = express();

app.use(express.static(path.join(__dirname, "../../client")));

registerHttpRoutes(app);
setupWebSocketServer();

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server started on port ${HTTP_PORT}`);
});
