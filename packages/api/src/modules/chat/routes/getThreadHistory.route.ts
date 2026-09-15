import { defineRoute } from "src/core/RouteBuilder";
import { GetThreadHistoryUseCase } from "src/modules/chat/useCases/GetThreadHistory.useCase";
import {
  threadHistoryQuerySchema,
  threadParamsSchema,
} from "src/modules/chat/validators";

export const getThreadHistoryRoute = defineRoute({
  method: "get",
  path: "/threads/:threadId/messages",
  auth: true,
  validators: { params: threadParamsSchema, query: threadHistoryQuerySchema },
  useCase: () => new GetThreadHistoryUseCase(),
  map: (req) => ({
    threadId: Number(req.params.threadId),
    beforeId: req.query.beforeId,
    limit: req.query.limit,
  }),
});
