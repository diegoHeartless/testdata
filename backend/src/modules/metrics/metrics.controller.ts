import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { MetricsService } from './metrics.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ApiKeyThrottlerGuard } from '../auth/guards/api-key-throttler.guard';
import { ApiResponseDto } from '../../types';
import { UserUsageMetrics, UserProfileMetrics } from './dto/user-metrics.dto';
import { ApiKeyEntity } from '../../database/entities/api-key.entity';

interface ApiKeyRequest extends Request {
  apiKeyEntity?: ApiKeyEntity;
}

@ApiTags('metrics')
@Controller('metrics')
@UseGuards(ApiKeyGuard, ApiKeyThrottlerGuard)
@ApiBearerAuth('api-key')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Получить метрики использования текущего API ключа' })
  @ApiResponse({ status: 200, description: 'Метрики успешно получены' })
  async getUsage(@Req() req: ApiKeyRequest): Promise<ApiResponseDto<UserUsageMetrics>> {
    const apiKeyId = req.apiKeyEntity?.id;
    if (!apiKeyId) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key not found',
        },
      };
    }

    const metrics = await this.metricsService.getUserUsageMetrics(apiKeyId);
    return {
      success: true,
      data: metrics,
    };
  }

  @Get('profiles')
  @ApiOperation({ summary: 'Получить метрики по профилям текущего API ключа' })
  @ApiResponse({ status: 200, description: 'Метрики по профилям успешно получены' })
  async getProfiles(@Req() req: ApiKeyRequest): Promise<ApiResponseDto<UserProfileMetrics>> {
    const apiKeyId = req.apiKeyEntity?.id;
    if (!apiKeyId) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key not found',
        },
      };
    }

    const metrics = await this.metricsService.getUserProfileMetrics(apiKeyId);
    return {
      success: true,
      data: metrics,
    };
  }
}

