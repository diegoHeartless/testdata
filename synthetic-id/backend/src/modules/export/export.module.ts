import { Module, forwardRef } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => ProfilesModule), AuthModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}

