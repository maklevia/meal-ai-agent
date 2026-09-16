import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { chatSocketEvents } from "src/modules/chat/Chat.sockets";
import { env } from "src/config/env";
import { SocketAuthMiddleware } from "src/sockets/auth";
import { healthPingSocket } from "src/sockets/events/healthPing.socket";
import { familyRoom, userRoom } from "src/sockets/rooms";
import { registerSocketEvents } from "src/sockets/SocketBuilder";
import { AppSocketServer } from "src/sockets/typedefs";
import { setChatRealtimeNotifier } from "src/modules/chat/realTime/chatNotifier";
import { SocketIOChatNotifier } from "src/modules/chat/sockets/SocketIOChatNotifier";

export function createSocketServer(httpServer: HttpServer): AppSocketServer {
  const io: AppSocketServer = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  setChatRealtimeNotifier(new SocketIOChatNotifier(io));

  io.use(new SocketAuthMiddleware().handle);

  registerSocketEvents(io, [healthPingSocket, ...chatSocketEvents]);

  io.on("connection", (socket) => {
    const { user, expiresAt } = socket.data;

    socket.join(userRoom(user.id));

    if (user.family) {
      socket.join(familyRoom(user.family.id));
    }

    socket.emit("auth:session", { expiresAt });
    
    console.log(
      `API: socket ${socket.id} connected user=${user.id} rooms=[${[...socket.rooms].join(", ")}]`,
    );

    socket.on("disconnect", (reason) => {
      console.log(`API: socket ${socket.id} disconnected (${reason})`);
    });
  });

  return io;
}
