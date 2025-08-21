import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAnnotationDto {
  @IsNumber()
  patient_id: number;

  @IsString()
  content: string;

  @IsString()
  category: string;
}

