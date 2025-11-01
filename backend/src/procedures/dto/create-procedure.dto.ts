import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProcedureDto {
  @ApiProperty({ description: 'Nome do procedimento', example: 'Limpeza' })
  @IsString()
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição do procedimento', example: 'Limpeza dental completa' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Categoria do procedimento', example: 'Preventivo' })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Valor estimado do procedimento', example: 150.00 })
  @IsNumber()
  @IsOptional()
  preco_estimado?: number;

  @ApiPropertyOptional({ description: 'Tempo estimado em minutos', example: 60 })
  @IsNumber()
  @IsOptional()
  tempo_estimado_min?: number;

  @ApiPropertyOptional({ description: 'Se o procedimento está ativo', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Observações sobre o procedimento' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}

