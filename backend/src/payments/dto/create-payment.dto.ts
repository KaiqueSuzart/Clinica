import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  PIX = 'pix',
  TRANSFERENCIA = 'transferencia',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID da consulta relacionada' })
  @IsString()
  @IsOptional()
  consulta_id?: string;

  @ApiProperty({ description: 'ID do paciente' })
  @IsString()
  paciente_id: string;

  @ApiProperty({ description: 'Valor do pagamento' })
  @IsNumber()
  valor: number;

  @ApiProperty({ 
    description: 'Forma de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.PIX
  })
  @IsEnum(PaymentMethod)
  forma_pagamento: PaymentMethod;

  @ApiPropertyOptional({ description: 'Data do pagamento' })
  @IsDateString()
  @IsOptional()
  data_pagamento?: string;

  @ApiPropertyOptional({ description: 'Observações sobre o pagamento' })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiPropertyOptional({ description: 'Descrição do procedimento/consulta' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Se o pagamento está confirmado' })
  @IsBoolean()
  @IsOptional()
  confirmado?: boolean;
}



