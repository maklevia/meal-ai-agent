import { GetThreadUseCase } from "src/modules/chat/useCases/GetThread.useCase";
import { threadIdPayloadSchema } from "src/modules/chat/validators";
import { threadRoom } from "src/sockets/rooms";
import { defineSocketEvent } from "src/sockets/SocketBuilder";

export const threadJoinSocket = defineSocketEvent({
    event: "thread:join",
    auth: true,
    schema: threadIdPayloadSchema,
    useCase: () => new GetThreadUseCase(),
    map: (payload) => ({threadId: payload.threadId}),
    onSuccess: (result, _payload, ctx) => {
        ctx.socket.join(threadRoom(result.thread.id))
    }
})
