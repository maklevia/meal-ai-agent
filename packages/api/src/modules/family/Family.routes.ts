import { Router } from "express";
import { registerRoute } from "src/core/RouteBuilder";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";
import { CreateFamilyUseCase } from "src/modules/family/useCases/CreateFamily.useCase";
import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";
import { GetFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GetFamilyInvitationLink.useCase";
import { JoinFamilyByInvitationLinkUseCase } from "src/modules/family/useCases/JoinFamilyByInvitationLink.useCase";
import { KickFamilyMemberUseCase } from "src/modules/family/useCases/KickFamilyMember.useCase";
import { LeaveFamilyUseCase } from "src/modules/family/useCases/LeaveFamily.useCase";
import {
  createFamilyBodySchema,
  joinFamilyBodySchema,
  kickMemberParamsSchema,
  leaveFamilyBodySchema,
} from "src/modules/family/validators";

export const familyRouter = Router();

registerRoute(familyRouter, {
  method: "post",
  path: "/",
  auth: true,
  validators: { body: createFamilyBodySchema },
  useCase: () => new CreateFamilyUseCase(),
  map: (req) => ({ familyName: req.body.familyName }),
  respond: (_, res) => res.status(201).json({ message: `Family created.` }),
});

registerRoute(familyRouter, {
  method: "put",
  path: "/invitation",
  auth: true,
  middlewares: [requireFamilyOwner],
  useCase: () => new GenerateFamilyInvitationLinkUseCase(),
  map: () => ({}),
});

registerRoute(familyRouter, {
  method: "get",
  path: "/invitation",
  auth: true,
  middlewares: [requireFamilyOwner],
  useCase: () => new GetFamilyInvitationLinkUseCase(),
  map: () => ({}),
});

registerRoute(familyRouter, {
  method: "post",
  path: "/members",
  auth: true,
  validators: { body: joinFamilyBodySchema },
  useCase: () => new JoinFamilyByInvitationLinkUseCase(),
  map: (req) => ({ invitationToken: req.body.invitationToken }),
});

registerRoute(familyRouter, {
  method: "delete",
  path: "/members/:email",
  auth: true,
  middlewares: [requireFamilyOwner],
  validators: { params: kickMemberParamsSchema },
  useCase: () => new KickFamilyMemberUseCase(),
  map: (req) => ({ memberEmail: req.params.email }),
});

registerRoute(familyRouter, {
  method: "post",
  path: "/leave",
  auth: true,
  validators: { body: leaveFamilyBodySchema },
  useCase: () => new LeaveFamilyUseCase(),
  map: (req) => ({ newOwnerEmail: req.body.newOwnerEmail }),
});
