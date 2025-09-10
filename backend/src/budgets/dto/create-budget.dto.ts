import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetItemDto {
  @ApiProperty({ description: 'Descrição do item' })
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Quantidade do item' })
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ description: 'Valor unitário do item' })
  @IsNumber()
  @Min(0)
  valor_unitario: number;

  @ApiProperty({ description: 'Valor total do item' })
  @IsNumber()
  @Min(0)
  valor_total: number;

  @ApiPropertyOptional({ description: 'Observações do item' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class CreateBudgetDto {
  @ApiProperty({ description: 'ID do cliente/paciente' })
  @IsString()
  cliente_id: string;

  @ApiPropertyOptional({ description: 'ID do dentista' })
  @IsOptional()
  @IsString()
  dentista_id?: string;

  @ApiPropertyOptional({ description: 'Descrição do orçamento' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'Valor total do orçamento' })
  @IsNumber()
  @Min(0)
  valor_total: number;

  @ApiPropertyOptional({ description: 'Valor do desconto' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;

  @ApiPropertyOptional({ description: 'Tipo do desconto', enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsString()
  tipo_desconto?: string;

  @ApiProperty({ description: 'Valor final do orçamento' })
  @IsNumber()
  @Min(0)
  valor_final: number;

  @ApiPropertyOptional({ description: 'Status do orçamento', enum: ['rascunho', 'enviado', 'aprovado', 'recusado', 'cancelado'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Data de validade do orçamento' })
  @IsDateString()
  data_validade: string;

  @ApiPropertyOptional({ description: 'Observações do orçamento' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({ description: 'Forma de pagamento' })
  @IsOptional()
  @IsString()
  forma_pagamento?: string;

  @ApiPropertyOptional({ description: 'Número de parcelas' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  parcelas?: number;

  @ApiPropertyOptional({ description: 'Itens do orçamento', type: [CreateBudgetItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  itens?: CreateBudgetItemDto[];
}
