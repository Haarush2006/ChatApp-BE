import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "./types/incmingmsg";
import { Client } from "./types/client";



const rooms = new Map<number, Set<Client>>();

const wss = new WebSocketServer({port: 8080})
let lastMessageAt = 0


wss.on("connection",(socket)=>{
    
    let currentClient: Client | null = null;
    console.log("Connected to the WSS")

    socket.on("message", (data) => {
        let parsed: IncomingMessage;

        try {
            parsed = JSON.parse(data .toString());
        } catch {
            socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
            return;
        }

        if (parsed.type === "join") {
            const roomId = parsed.roomId;

            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            const room = rooms.get(roomId)!;
            for (const client of room) {
                if (client.username === parsed.username) {
                    socket.send(JSON.stringify({
                        type: "error",
                        message: "Username already taken"
                    }));
                    return;
                }
            }

            currentClient = {
                username: parsed.username,
                socket,
                roomId
            }

            rooms.get(roomId)!.add(currentClient);
            broadcast(currentClient.roomId,{
                type:"system",
                senderName: currentClient.username,
                message: `User ${currentClient.username} joined`})


        }



        if(parsed.type == "chat"){
            if (!currentClient) {
                socket.send(
                    JSON.stringify({ type: "error", message: "Join a room first" })
                );
                return;
            }
             const now = Date.now();
            if (now - lastMessageAt < 300) return; 
            lastMessageAt = now;

            const userRoom = currentClient.roomId
            broadcast(userRoom, {
                type:"chat",
                senderName: currentClient.username,
                message: parsed.message,
            });


        }

    }),
    socket.on("close", () => {
        if (!currentClient) return;

        const room = rooms.get(currentClient.roomId);
        room?.delete(currentClient);

        if (room && room.size === 0) {
            rooms.delete(currentClient.roomId);
        }

        broadcast(currentClient.roomId, {
            type:"system",
            senderName:currentClient.username,
            message: `User ${currentClient.username} left`,
        });
  });

})




// function broadcast(roomId: number, payload:{
//     senderName: string
//     message:string}) {
//   const room = rooms.get(roomId);
//   if (!room) return;

//   const message = payload.message;

//   room.forEach((client) => {
//     client.socket.send(message);
//   });
// }



function broadcast(
  roomId: number,
  payload: {
    type?:string,
    senderName: string;
    message: string;
  }
) {
  const room = rooms.get(roomId);
  if (!room) return;

  const data = JSON.stringify({
    type: payload.type,
    sender: payload.senderName,
    message: payload.message,
    timestamp: Date.now(),
  });

  room.forEach((client) => {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(data);
    }
  });
}
