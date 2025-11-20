import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCoreTables1710780000000 implements MigrationInterface {
  name = 'InitCoreTables';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "label" varchar(128) NOT NULL,
        "key_hash" text NOT NULL,
        "status" varchar(16) NOT NULL DEFAULT 'active',
        "rate_limit_per_min" integer NOT NULL DEFAULT 100,
        "last_used_at" TIMESTAMPTZ,
        "expires_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "payload" jsonb NOT NULL,
        "source_key_id" uuid,
        "expires_at" TIMESTAMPTZ,
        "deleted_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profiles_source_key" FOREIGN KEY ("source_key_id") REFERENCES "api_keys" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_profiles_created_at" ON "profiles" ("created_at");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_profiles_source_key" ON "profiles" ("source_key_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "exports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "profile_id" uuid NOT NULL,
        "format" varchar(16) NOT NULL,
        "status" varchar(16) NOT NULL,
        "file_path" text,
        "error_message" text,
        "requested_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exports_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_exports_profile" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_exports_profile" ON "exports" ("profile_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_exports_profile"`);
    await queryRunner.query(`DROP TABLE "exports"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_profiles_source_key"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_profiles_created_at"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}


