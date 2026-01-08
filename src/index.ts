import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "./types/incmingmsg";
import { Client } from "./types/client";



const rooms = new Map<number, Set<Client>>();

const wss = new WebSocketServer({port: 8080})


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

            currentClient = {
                username: parsed.username,
                socket,
                roomId
            }
            rooms.get(roomId)!.add(currentClient);


        }



        if(parsed.type == "chat"){
            if (!currentClient) {
                socket.send(
                    JSON.stringify({ type: "error", message: "Join a room first" })
                );
                return;
            }

            const userRoom = currentClient.roomId
            broadcast(userRoom, {
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
            type: "system",
            message: `User ${currentClient.username} left`,
        });
  });

})




function broadcast(roomId: number, payload:any) {
  const room = rooms.get(roomId);
  if (!room) return;

  const message = payload.message;

  room.forEach((client) => {
    client.socket.send(message);
  });
}