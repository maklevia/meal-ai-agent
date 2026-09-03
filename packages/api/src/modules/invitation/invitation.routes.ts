import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { InvitationController } from "src/modules/invitation/Invitation.controller";
import { createInvitationBodySchema, validateInvitationParamsSchema } from "src/modules/invitation/validators";

export const invitationRouter = Router();

const invitationController: InvitationController = new InvitationController(); 

invitationRouter.post("/", authMiddleware, requireAdmin, validate({body: createInvitationBodySchema}), invitationController.createInvitation);
invitationRouter.get("/:invitationCode/validate", validate({params: validateInvitationParamsSchema}), invitationController.validateInvitation);
