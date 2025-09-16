import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SearchPatientDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  Cpf?: string;

  @IsString()
  @IsOptional()
  Email?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  iaativa?: boolean;

  @IsString()
  @IsOptional()
  empresa?: string;
}


















