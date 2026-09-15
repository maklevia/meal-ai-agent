import { defineRoute } from "src/core/RouteBuilder";
import { GetThreadUseCase } from "src/modules/chat/useCases/GetThread.useCase";
import { threadParamsSchema } from "src/modules/chat/validators";

export const getThreadRoute = defineRoute({
  method: "get",
  path: "/threads/:threadId",
  auth: true,
  validators: { params: threadParamsSchema },
  useCase: () => new GetThreadUseCase(),
  map: (req) => ({ threadId: Number(req.params.threadId) }),
});
