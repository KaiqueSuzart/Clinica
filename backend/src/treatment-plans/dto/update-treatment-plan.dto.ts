import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateTreatmentPlanDto } from './create-treatment-plan.dto';

export class UpdateTreatmentPlanDto extends PartialType(CreateTreatmentPlanDto) {}

export class UpdateProgressDto {
  @IsNumber()
  @IsOptional()
  progress?: number;
}
