import WebSocket = require("ws");


export type Client = {
  username: string;
  socket: WebSocket;
  roomId: number;
};