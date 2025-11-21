import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToApiKeys1733000000000 implements MigrationInterface {
  name = 'AddRoleToApiKeys1733000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD COLUMN "role" varchar(16) NOT NULL DEFAULT 'user'
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_api_keys_role" ON "api_keys" ("role")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_api_keys_role"
    `);

    await queryRunner.query(`
      ALTER TABLE "api_keys"
      DROP COLUMN "role"
    `);
  }
}

