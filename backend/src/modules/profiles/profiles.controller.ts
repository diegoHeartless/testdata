import { Controller, Post, Get, Body, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { GenerateProfileDto } from './dto/generate-profile.dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { ApiResponseDto } from '../../types';

@ApiTags('profiles')
@Controller('profiles')
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('api-key')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Генерация нового синтетического профиля' })
  @ApiResponse({ status: 200, description: 'Профиль успешно сгенерирован' })
  @ApiResponse({ status: 400, description: 'Невалидные параметры' })
  @ApiResponse({ status: 401, description: 'Неверный API ключ' })
  @ApiResponse({ status: 429, description: 'Превышен rate limit' })
  async generate(@Body() dto: GenerateProfileDto): Promise<ApiResponseDto<any>> {
    const profile = await this.profilesService.generate(dto);
    return {
      success: true,
      data: {
        id: profile.id,
        profile,
        created_at: profile.created_at,
        expires_at: profile.expires_at,
      },
      meta: {
        request_id: profile.id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение профиля по ID' })
  @ApiResponse({ status: 200, description: 'Профиль найден' })
  @ApiResponse({ status: 404, description: 'Профиль не найден' })
  async getById(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    const profile = await this.profilesService.findById(id);
    if (!profile) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found',
        },
      };
    }
    return {
      success: true,
      data: {
        id: profile.id,
        profile,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Список профилей' })
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.profilesService.list(page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление профиля' })
  async delete(@Param('id') id: string): Promise<ApiResponseDto<any>> {
    await this.profilesService.delete(id);
    return {
      success: true,
      data: {
        id,
        deleted: true,
      },
    };
  }
}
