import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAnnotationDto {
  @IsNumber()
  patient_id: number;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsBoolean()
  is_private?: boolean;
}








