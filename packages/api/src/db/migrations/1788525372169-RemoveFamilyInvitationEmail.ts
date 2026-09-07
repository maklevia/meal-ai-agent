import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFamilyInvitationEmail1788525372169 implements MigrationInterface {
    name = 'RemoveFamilyInvitationEmail1788525372169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_invitation" DROP COLUMN "email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_invitation" ADD "email" character varying(255) NOT NULL`);
    }

}
