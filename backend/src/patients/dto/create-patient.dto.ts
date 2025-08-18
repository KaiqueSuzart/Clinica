import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsNumber()
  @IsOptional()
  empresa?: number;

  @IsBoolean()
  @IsOptional()
  iaativa?: boolean;

  @IsString()
  @IsOptional()
  Email?: string;

  @IsNumber()
  @IsOptional()
  Cpf?: number;

  @IsString()
  @IsOptional()
  data_nascimento?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  ultima_visita?: string;

  @IsDateString()
  @IsOptional()
  proximo_retorno?: string;

  @IsString()
  @IsOptional()
  responsavel_nome?: string;

  @IsString()
  @IsOptional()
  responsavel_telefone?: string;

  @IsString()
  @IsOptional()
  responsavel_parente?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  emergency_contact_name?: string;

  @IsString()
  @IsOptional()
  emergency_contact_phone?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}

