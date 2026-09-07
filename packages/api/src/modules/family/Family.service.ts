import { Service } from "src/core/Service.base";

export class FamilyService extends Service {
  createFamilyInvitationLink(invitationToken: string): string {
    return `${this.env.CLIENT_ORIGIN}/family/join?token=${invitationToken}`;
  }
}
