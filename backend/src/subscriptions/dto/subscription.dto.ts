import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'ID do plano de assinatura' })
  @IsNumber()
  plan_id: number;

  @ApiProperty({ description: 'Valor mensal da assinatura' })
  @IsNumber()
  valor_mensal: number;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'Status da assinatura', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Data de fim da assinatura', required: false })
  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @ApiProperty({ description: 'Próxima data de cobrança', required: false })
  @IsOptional()
  @IsDateString()
  proxima_cobranca?: string;
}

export class ChatbotBillingDto {
  @ApiProperty({ description: 'Data da cobrança' })
  @IsDateString()
  data_cobranca: string;

  @ApiProperty({ description: 'Número de tokens utilizados' })
  @IsNumber()
  tokens_utilizados: number;

  @ApiProperty({ description: 'Custo dos tokens' })
  @IsNumber()
  custo_tokens: number;

  @ApiProperty({ description: 'Custo do Railway' })
  @IsNumber()
  custo_railway: number;

  @ApiProperty({ description: 'Custo total' })
  @IsNumber()
  custo_total: number;
}

export class PaymentHistoryDto {
  @ApiProperty({ description: 'Tipo de pagamento' })
  @IsString()
  tipo: string;

  @ApiProperty({ description: 'Valor do pagamento' })
  @IsNumber()
  valor: number;

  @ApiProperty({ description: 'Descrição do pagamento' })
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Método de pagamento', required: false })
  @IsOptional()
  @IsString()
  metodo_pagamento?: string;

  @ApiProperty({ description: 'Referência externa', required: false })
  @IsOptional()
  @IsString()
  referencia_externa?: string;
}
