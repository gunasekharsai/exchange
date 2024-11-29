import { WebSocketServer } from "ws";
import { UserManager } from "./usermanager";


const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
    console.log("new connection on port 3001");  
    UserManager.getInstance().addUser(ws);
});