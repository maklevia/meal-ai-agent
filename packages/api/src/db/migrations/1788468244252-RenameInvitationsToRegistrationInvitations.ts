import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameInvitationsToRegistrationInvitations1788468244252 implements MigrationInterface {
    name = 'RenameInvitationsToRegistrationInvitations1788468244252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" RENAME TO "registration_invitations"`);
        await queryRunner.query(`ALTER TYPE "public"."invitations_role_enum" RENAME TO "registration_invitations_role_enum"`);
        await queryRunner.query(`ALTER INDEX "IDX_97ab59cb592c7cec109741b592" RENAME TO "IDX_registration_invitations_email"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" TO "PK_registration_invitations"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "FK_d4de0403dd012cf87b430af70ef" TO "FK_registration_invitations_invited_by"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "CHK_539b0c58588fddd096783e1a87" TO "CHK_registration_invitations_expires_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "CHK_registration_invitations_expires_at" TO "CHK_539b0c58588fddd096783e1a87"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "FK_registration_invitations_invited_by" TO "FK_d4de0403dd012cf87b430af70ef"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME CONSTRAINT "PK_registration_invitations" TO "PK_5dec98cfdfd562e4ad3648bbb07"`);
        await queryRunner.query(`ALTER INDEX "IDX_registration_invitations_email" RENAME TO "IDX_97ab59cb592c7cec109741b592"`);
        await queryRunner.query(`ALTER TYPE "public"."registration_invitations_role_enum" RENAME TO "invitations_role_enum"`);
        await queryRunner.query(`ALTER TABLE "registration_invitations" RENAME TO "invitations"`);
    }

}
