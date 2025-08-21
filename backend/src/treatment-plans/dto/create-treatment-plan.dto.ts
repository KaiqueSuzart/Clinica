import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTreatmentItemDto {
  @IsString()
  @IsNotEmpty()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsEnum(['alta', 'media', 'baixa'])
  priority: 'alta' | 'media' | 'baixa';

  @IsNumber()
  estimatedCost: number;

  @IsNumber()
  estimatedSessions: number;

  @IsEnum(['planejado', 'em_andamento', 'concluido', 'cancelado'])
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  order: number;
}

export class CreateTreatmentPlanDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTreatmentItemDto)
  items: CreateTreatmentItemDto[];

  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @IsOptional()
  @IsNumber()
  progress?: number;
}
