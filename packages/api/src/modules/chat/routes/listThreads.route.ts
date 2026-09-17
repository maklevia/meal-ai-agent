import { defineRoute } from "src/core/RouteBuilder";
import { ListThreadsUseCase } from "src/modules/chat/useCases/ListThreads.useCase";

export const listThreadsRoute = defineRoute({
  method: "get",
  path: "/threads",
  auth: true,
  useCase: () => new ListThreadsUseCase(),
});
