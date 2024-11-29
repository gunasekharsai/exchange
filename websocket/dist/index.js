"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const usermanager_1 = require("./usermanager");
const wss = new ws_1.WebSocketServer({ port: 3001 });
wss.on("connection", (ws) => {
    console.log("new connection on port 3001");
    usermanager_1.UserManager.getInstance().addUser(ws);
});
