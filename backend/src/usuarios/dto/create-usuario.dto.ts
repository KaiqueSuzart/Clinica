import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nome completo' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Cargo do usuário', example: 'Recepcionista', enum: ['Dentista', 'Recepcionista', 'Auxiliar', 'Admin'] })
  @IsString()
  cargo: string;

  @ApiProperty({ description: 'ID da empresa' })
  @IsString()
  empresa_id: string;

  @ApiPropertyOptional({ description: 'Permissões especiais (JSON)' })
  @IsOptional()
  permissoes?: any;

  @ApiPropertyOptional({ description: 'Se o usuário está ativo', default: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'URL do avatar' })
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'Telefone' })
  @IsString()
  @IsOptional()
  telefone?: string;
}

