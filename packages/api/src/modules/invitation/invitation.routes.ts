import { Router } from "express";
import { authMiddleware } from "src/middlewares/authMiddleware.js";
import { requireAdmin } from "src/middlewares/requireAdmin.js";
import { InvitationController } from "src/modules/invitation/Invitation.controller.js";

export const invitationRoutes = Router();

const invitationController: InvitationController = new InvitationController(); 

invitationRoutes.post("/", authMiddleware, requireAdmin, invitationController.createInvitation);
invitationRoutes.get("/:invitationCode/validate", invitationController.validateInvitation);
