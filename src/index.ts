import { WebSocketServer, WebSocket } from "ws"

interface Client {
  socket: WebSocket
  username: string
  roomId: string
}

interface Message {
  type: "chat" | "system"
  sender: string
  message: string
  timestamp: number
}

interface RoomData {
  messages: Message[]
  expiresAt: number
}

const wss = new WebSocketServer({ port: 8080 })

const rooms = new Map<string, Set<Client>>()
const roomStore = new Map<string, RoomData>()

const ROOM_TTL = 30 * 60 * 1000 

function getRoom(roomId: string): RoomData {
  const now = Date.now()
  const room = roomStore.get(roomId)

  if (!room || room.expiresAt < now) {
    const freshRoom: RoomData = {
      messages: [],
      expiresAt: now + ROOM_TTL,
    }
    roomStore.set(roomId, freshRoom)
    return freshRoom
  }

  return room
}

wss.on("connection", (socket) => {
  let currentClient: Client | null = null

  socket.on("message", (raw) => {
    const data = JSON.parse(raw.toString())

    if (data.type === "join") {
      const { username, roomId } = data
      currentClient = { socket, username, roomId }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set())
      }

      rooms.get(roomId)!.add(currentClient)

      const room = getRoom(roomId)

      socket.send(
        JSON.stringify({
          type: "history",
          messages: room.messages,
        })
      )

      broadcast(roomId, {
        type: "system",
        sender: "system",
        message: `${username} joined the room`,
        timestamp: Date.now(),
      })

      return
    }

    if (data.type === "chat" && currentClient) {
      const room = getRoom(currentClient.roomId)

      const msg: Message = {
        type: "chat",
        sender: currentClient.username,
        message: data.message,
        timestamp: Date.now(),
      }

      room.messages.push(msg)
      room.expiresAt = Date.now() + ROOM_TTL

      broadcast(currentClient.roomId, msg)
    }
  })

  socket.on("close", () => {
    if (!currentClient) return

    const { roomId, username } = currentClient
    rooms.get(roomId)?.delete(currentClient)

    broadcast(roomId, {
      type: "system",
      sender: "system",
      message: `${username} left the room`,
      timestamp: Date.now(),
    })
  })
})

setInterval(() => {
  const now = Date.now()

  for (const [roomId, room] of roomStore.entries()) {
    if (room.expiresAt < now) {
      roomStore.delete(roomId)
      rooms.delete(roomId)
      console.log(`Room ${roomId} expired and deleted`)
    }
  }
}, 60 * 1000) 

function broadcast(roomId: string, payload: Message) {
  const clients = rooms.get(roomId)
  if (!clients) return

  for (const client of clients) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(payload))
    }
  }
}
console.log("WebSocket server running on port 8080")
