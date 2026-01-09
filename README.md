# RoomsBackend - Chat App Backend

A simple WebSocket-based backend for a multi-room chat application. This backend allows clients to join chat rooms, send and receive messages in real-time, and maintains message history for each room with automatic expiration.

## Features
- Real-time chat using WebSockets
- Multiple chat rooms support
- Message history per room (auto-expires after 30 minutes of inactivity)
- System messages for join/leave events
- Simple, stateless server (no database required)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd RoomsBackend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Server
To start the server in development mode:
```sh
npm run dev
```
The WebSocket server will run on `ws://localhost:8080`.

## WebSocket API

### Events
- **Join Room**
  ```json
  { "type": "join", "username": "yourName", "roomId": "room1" }
  ```
- **Send Chat Message**
  ```json
  { "type": "chat", "message": "Hello!" }
  ```
- **Receive Message**
  ```json
  { "type": "chat", "sender": "user", "message": "Hello!", "timestamp": 123456789 }
  ```
- **Receive System Message**
  ```json
  { "type": "system", "sender": "system", "message": "user joined the room", "timestamp": 123456789 }
  ```
- **Receive History**
  ```json
  { "type": "history", "messages": [ ... ] }
  ```

## Project Structure
- `src/index.ts` - Main WebSocket server implementation
- `src/types/` - TypeScript type definitions

## Author

Haarush
