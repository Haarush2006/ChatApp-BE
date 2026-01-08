 export type IncomingMessage =
    { type: "join"; username: string; roomId: number }
  | { type: "chat"; message: string };