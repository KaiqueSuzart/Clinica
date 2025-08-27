import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsDateString, ValidateNested, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class TreatmentSessionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber()
  session_number?: number;

  @IsOptional()
  @IsNumber()
  sessionNumber?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class CreateTreatmentItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  tooth?: string;

  @IsIn(['alta', 'media', 'baixa'])
  priority: 'alta' | 'media' | 'baixa';

  @IsNumber()
  estimatedCost: number;

  @IsNumber()
  estimatedSessions: number;

  @IsIn(['planejado', 'em_andamento', 'concluido', 'cancelado'])
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentSessionDto)
  sessions?: TreatmentSessionDto[];
}

export class CreateTreatmentPlanDto {
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

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
