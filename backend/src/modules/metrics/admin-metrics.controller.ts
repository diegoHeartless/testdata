import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { MetricsService } from './metrics.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ApiKeyThrottlerGuard } from '../auth/guards/api-key-throttler.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiResponseDto } from '../../types';
import { SystemMetrics, UsersMetrics } from './dto/admin-metrics.dto';

@ApiTags('admin-metrics')
@Controller('admin/metrics')
@UseGuards(ApiKeyGuard, ApiKeyThrottlerGuard, AdminGuard)
@ApiBearerAuth('api-key')
export class AdminMetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('system')
  @ApiOperation({ summary: 'Получить системные метрики (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Системные метрики успешно получены' })
  @ApiResponse({ status: 403, description: 'Требуются права администратора' })
  async getSystem(@Req() req: Request): Promise<ApiResponseDto<SystemMetrics>> {
    const metrics = await this.metricsService.getSystemMetrics();
    return {
      success: true,
      data: metrics,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'Получить метрики по всем пользователям (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Метрики по пользователям успешно получены' })
  @ApiResponse({ status: 403, description: 'Требуются права администратора' })
  async getUsers(@Req() req: Request): Promise<ApiResponseDto<UsersMetrics>> {
    const metrics = await this.metricsService.getUsersMetrics();
    return {
      success: true,
      data: metrics,
    };
  }
}

