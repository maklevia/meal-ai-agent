import { Router } from "express";
import { authMiddleware } from "src/middlewares/authMiddleware";
import { requireAdmin } from "src/middlewares/requireAdmin";
import { InvitationController } from "src/modules/invitation/Invitation.controller";

export const invitationRoutes = Router();

const invitationController: InvitationController = new InvitationController(); 

invitationRoutes.post("/", authMiddleware, requireAdmin, invitationController.createInvitation);
invitationRoutes.get("/:token/validate", invitationController.validateInvitation);
