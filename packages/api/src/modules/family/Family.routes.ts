import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { FamilyController } from "src/modules/family/Family.controller";
import { createFamilyBodySchema, joinFamilyBodySchema } from "src/modules/family/validators";

export const familyRouter = Router();

const familyController = new FamilyController();

familyRouter.post(
  "/",
  authMiddleware,
  validate({ body: createFamilyBodySchema }),
  familyController.createFamily,
);

familyRouter.put(
  "/invitation",
  authMiddleware,
  requireFamilyOwner,
  familyController.generateInvitationLink,
);

familyRouter.get(
  "/invitation",
  authMiddleware,
  requireFamilyOwner,
  familyController.getInvitationLink,
);

familyRouter.patch("/join", authMiddleware, validate({body: joinFamilyBodySchema}), familyController.joinFamily);
