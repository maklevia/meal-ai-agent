import { defineSocketEvent } from "src/sockets/SocketBuilder";
import { PingUseCase } from "src/sockets/useCases/Ping.useCase";

type PingResult = {pong: true, at: string};

export const healthPingSocket = defineSocketEvent<undefined, void, PingResult>({
    event: "health:ping",
    auth: true,
    useCase: () => new PingUseCase(),
    map: () => undefined 
})