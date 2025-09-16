import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmpresaDto {
  @ApiProperty({ description: 'Nome da empresa' })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({ description: 'Email da empresa' })
  @IsEmail()
  @IsOptional()
  email_empresa?: string;

  @ApiProperty({ description: 'Telefone da empresa' })
  @IsString()
  @IsOptional()
  telefone?: string;

  @ApiProperty({ description: 'Endereço da empresa' })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ description: 'URL do logo da empresa' })
  @IsString()
  @IsOptional()
  logo_url?: string;

  @ApiProperty({ description: 'CNPJ da empresa' })
  @IsString()
  @IsOptional()
  cnpj?: string;

  // @ApiProperty({ description: 'Descrição da empresa' })
  // @IsString()
  // @IsOptional()
  // descricao?: string;
}
