import { defineRoute } from "src/core/RouteBuilder";
import { CreateThreadUseCase } from "src/modules/chat/useCases/CreateThread.useCase";
import { createThreadBodySchema } from "src/modules/chat/validators";

export const createThreadRoute = defineRoute({
  method: "post",
  path: "/threads",
  auth: true,
  validators: { body: createThreadBodySchema },
  useCase: () => new CreateThreadUseCase(),
  map: (req) => ({ title: req.body.title, scope: req.body.scope }),
  respond: (result, res) => res.status(201).json(result),
});
