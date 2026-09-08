import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { FamilyController } from "src/modules/family/Family.controller";
import { createFamilyBodySchema, joinFamilyBodySchema, kickMemberParamsSchema, leaveFamilyBodySchema } from "src/modules/family/validators";

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

familyRouter.post(
  "/members",
  authMiddleware,
  validate({ body: joinFamilyBodySchema }),
  familyController.joinFamily,
);

familyRouter.delete(
  "/members/:email",
  authMiddleware,
  requireFamilyOwner,
  validate({ params: kickMemberParamsSchema }),
  familyController.kickMember,
);

familyRouter.post(
  "/leave",
  authMiddleware, 
  validate({body: leaveFamilyBodySchema}),
  familyController.leaveFamily,
)
