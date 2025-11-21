import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { AdminMetricsController } from './admin-metrics.controller';
import { MetricsService } from './metrics.service';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { ApiKeyEntity } from '../../database/entities/api-key.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileEntity, ApiKeyEntity]),
    AuthModule,
  ],
  controllers: [MetricsController, AdminMetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

