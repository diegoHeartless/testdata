import { ApiKeyEntity } from '../database/entities/api-key.entity';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      apiKeyEntity?: ApiKeyEntity;
      apiKey?: string;
      startTime?: number;
    }
  }
}

