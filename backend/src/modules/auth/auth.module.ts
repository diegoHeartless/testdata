import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyEntity } from '../../database/entities/api-key.entity';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiKeyService } from './services/api-key.service';
import { ApiKeyThrottlerGuard } from './guards/api-key-throttler.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  providers: [ApiKeyService, ApiKeyGuard, ApiKeyThrottlerGuard],
  exports: [ApiKeyService, ApiKeyGuard, ApiKeyThrottlerGuard],
})
export class AuthModule {}

