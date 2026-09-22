import { ReceiveUserMessageUseCase } from "src/modules/chat/useCases/ReceiveUserMessage.useCase";
import { sendMessagePayloadSchema } from "src/modules/chat/validators";
import { threadRoom } from "src/sockets/rooms";
import { defineSocketEvent } from "src/sockets/SocketBuilder";

export const messageSendSocket = defineSocketEvent({
  event: "message:send",
  auth: true,
  schema: sendMessagePayloadSchema,
  useCase: () => new ReceiveUserMessageUseCase(),
  map: (payload) => ({
    threadId: payload.threadId,
    content: payload.content,
    clientMessageId: payload.clientMessageId,
  }),
  onSuccess: (result, payload, ctx) => {
    ctx.socket.to(threadRoom(payload.threadId)).emit("message:created", {
      message: result.message,
    });
  },
});
