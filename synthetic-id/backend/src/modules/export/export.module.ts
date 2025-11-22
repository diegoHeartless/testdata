import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthModule } from '../auth/auth.module';
import { ExportEntity } from '../../database/entities/export.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportEntity]),
    forwardRef(() => ProfilesModule),
    AuthModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}

