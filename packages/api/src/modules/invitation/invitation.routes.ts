import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware.js";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware.js";
import { validate } from "src/middlewares/validate.middleware.js";
import { InvitationController } from "src/modules/invitation/Invitation.controller.js";
import { createInvitationBodySchema, validateInvitationParamsSchema } from "src/modules/invitation/validators.js";

export const invitationRouter = Router();

const invitationController: InvitationController = new InvitationController(); 

invitationRouter.post("/", authMiddleware, requireAdmin, validate({body: createInvitationBodySchema}), invitationController.createInvitation);
invitationRouter.get("/:invitationCode/validate", validate({params: validateInvitationParamsSchema}), invitationController.validateInvitation);
