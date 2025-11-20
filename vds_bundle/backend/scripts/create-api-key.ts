import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import dataSource from '../src/database/typeorm.config';
import { ApiKeyEntity } from '../src/database/entities/api-key.entity';

interface ParsedArgs {
  label?: string;
  rate?: number;
  expiresInDays?: number;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const parsed: ParsedArgs = {};

  args.forEach((arg, index) => {
    if (arg === '--label') {
      parsed.label = args[index + 1];
    }
    if (arg === '--rate') {
      parsed.rate = Number(args[index + 1]);
    }
    if (arg === '--expires-in-days') {
      parsed.expiresInDays = Number(args[index + 1]);
    }
  });

  return parsed;
}

function generateApiKey(): string {
  const prefix = 'sk_live';
  const body = randomBytes(16).toString('hex');
  return `${prefix}_${body}`;
}

async function bootstrap() {
  const { label = 'default', rate = 100, expiresInDays } = parseArgs();
  const apiKey = generateApiKey();
  const keyHash = await bcrypt.hash(apiKey, 12);

  let expiresAt: Date | undefined;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  }

  try {
    await dataSource.initialize();
    const repository = dataSource.getRepository(ApiKeyEntity);
    const entity = repository.create({
      label,
      keyHash,
      status: 'active',
      rateLimitPerMin: rate,
      expiresAt,
    });
    await repository.save(entity);
    // eslint-disable-next-line no-console
    console.log('API key created successfully');
    // eslint-disable-next-line no-console
    console.log(`Key ID: ${entity.id}`);
    // eslint-disable-next-line no-console
    console.log(`Use this key once and store securely: ${apiKey}`);
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to create API key', error);
    process.exit(1);
  }
}

bootstrap();


