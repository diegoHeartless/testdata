import * as path from 'path';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ApiKeyEntity } from './entities/api-key.entity';
import { ProfileEntity } from './entities/profile.entity';
import { ExportEntity } from './entities/export.entity';

config({ path: process.env.ENV_FILE ?? '.env' });

const defaultDatabaseUrl = 'postgres://postgres:postgres@localhost:5432/synthetic_id';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  entities: [ApiKeyEntity, ProfileEntity, ExportEntity],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
};

const dataSource = new DataSource(typeOrmConfig);

export default dataSource;


