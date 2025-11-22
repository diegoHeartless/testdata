import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ApiKeyThrottlerGuard } from '../auth/guards/api-key-throttler.guard';
import { ProfilesService } from '../profiles/profiles.service';

@ApiTags('export')
@Controller('profiles/:id/export')
@UseGuards(ApiKeyGuard, ApiKeyThrottlerGuard)
@ApiBearerAuth('api-key')
export class ExportController {
  constructor(
    private exportService: ExportService,
    private profilesService: ProfilesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Экспорт профиля в JSON или PDF' })
  @ApiResponse({ status: 200, description: 'Файл успешно экспортирован' })
  @ApiResponse({ status: 404, description: 'Профиль не найден' })
  async export(
    @Param('id') id: string,
    @Query('format') format: 'json' | 'pdf' = 'json',
    @Res() res: Response,
  ) {
    const profile = await this.profilesService.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found',
        },
      });
    }

    if (format === 'json') {
      const json = this.exportService.toJSON(profile);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="profile-${id}.json"`);
      return res.send(JSON.stringify(json, null, 2));
    }

    if (format === 'pdf') {
      const pdfBuffer = await this.exportService.toPDF(profile);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="profile-${id}.pdf"`);
      return res.send(pdfBuffer);
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid format. Use "json" or "pdf"',
      },
    });
  }
}

