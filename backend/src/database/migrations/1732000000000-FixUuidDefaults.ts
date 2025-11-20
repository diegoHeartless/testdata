import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUuidDefaults1732000000000 implements MigrationInterface {
  name = 'FixUuidDefaults';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Исправляем api_keys
    await queryRunner.query(`
      ALTER TABLE "api_keys" 
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);

    // Исправляем profiles
    await queryRunner.query(`
      ALTER TABLE "profiles" 
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);

    // Исправляем exports
    await queryRunner.query(`
      ALTER TABLE "exports" 
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откатываем изменения
    await queryRunner.query(`
      ALTER TABLE "api_keys" 
      ALTER COLUMN "id" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "profiles" 
      ALTER COLUMN "id" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "exports" 
      ALTER COLUMN "id" DROP DEFAULT
    `);
  }
}

