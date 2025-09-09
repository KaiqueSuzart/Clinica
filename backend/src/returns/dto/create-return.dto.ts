import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateReturnDto {
  @ApiProperty({ description: 'ID do cliente/paciente' })
  @IsString()
  cliente_id: string;

  @ApiProperty({ description: 'ID da consulta original (opcional)' })
  @IsOptional()
  @IsString()
  consulta_original_id?: string;

  @ApiProperty({ description: 'Data do retorno' })
  @IsDateString()
  data_retorno: string;

  @ApiProperty({ description: 'Hora do retorno' })
  @IsString()
  hora_retorno: string;

  @ApiProperty({ description: 'Motivo do retorno' })
  @IsString()
  motivo: string;

  @ApiProperty({ description: 'Procedimento a ser realizado' })
  @IsString()
  procedimento: string;

  @ApiProperty({ description: 'Status do retorno', enum: ['pendente', 'confirmado', 'realizado', 'cancelado'] })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}

