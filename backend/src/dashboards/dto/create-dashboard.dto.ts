import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WidgetDto {
  @IsString() type: string;
  @IsString() title: string;
  @IsObject() config: Record<string, unknown>;
  @IsObject() position: Record<string, unknown>;
}

export class CreateDashboardDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() datasetId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() config?: Record<string, unknown>;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isPublic?: boolean;
  @ApiProperty({ required: false, type: [WidgetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetDto)
  widgets?: WidgetDto[];
}
