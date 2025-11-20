import { IsOptional, IsEnum, IsArray, IsString, IsNumber, Min, Max, ArrayMinSize, ArrayMaxSize, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GenerateProfileDto {
  @ApiPropertyOptional({ enum: ['male', 'female', 'random'], default: 'random' })
  @IsOptional()
  @IsEnum(['male', 'female', 'random'])
  gender?: 'male' | 'female' | 'random';

  @ApiPropertyOptional({ type: [Number], minItems: 2, maxItems: 2, example: [25, 35] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @Min(18, { each: true })
  @Max(100, { each: true })
  age_range?: [number, number];

  @ApiPropertyOptional({ example: '77', description: 'Код региона РФ' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['passport', 'inn', 'snils'],
    description: 'Список документов для генерации',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  include_documents?: string[];
}
