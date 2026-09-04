import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { FamilyController } from "src/modules/family/Family.controller";
import { createInvitationLinkBodySchema } from "src/modules/family/validators";

export const familyRouter = Router();

const familyController = new FamilyController();

familyRouter.post(
  "/invitation",
  authMiddleware,
  validate({ body: createInvitationLinkBodySchema }),
  familyController.createInvitationLink,
);
