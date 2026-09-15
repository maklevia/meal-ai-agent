import { LeaveThreadUseCase } from "src/modules/chat/useCases/LeaveThread.useCase";
import { threadIdPayloadSchema } from "src/modules/chat/validators";
import { threadRoom } from "src/sockets/rooms";
import { defineSocketEvent } from "src/sockets/SocketBuilder";

export const threadLeaveSocket = defineSocketEvent({
    event: "thread:leave",
    auth: true,
    schema: threadIdPayloadSchema,
    useCase: () => new LeaveThreadUseCase(),
    map: (payload) => ({threadId: payload.threadId}),
    onSuccess: (_result, payload, ctx) => {
        ctx.socket.leave(threadRoom(payload.threadId))
    }
})
