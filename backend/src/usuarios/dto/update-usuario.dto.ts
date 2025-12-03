import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsPhoneNumber, IsBoolean } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: false 
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({ 
    description: 'Telefone do usuário',
    example: '(11) 99999-9999',
    required: false 
  })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ 
    description: 'Cargo do usuário',
    example: 'Dentista',
    required: false 
  })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiProperty({ 
    description: 'Status ativo do usuário',
    example: true,
    required: false 
  })
  @IsOptional()
  ativo?: boolean;

  @ApiProperty({ 
    description: 'URL do avatar do usuário',
    example: 'https://example.com/avatar.jpg',
    required: false 
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
