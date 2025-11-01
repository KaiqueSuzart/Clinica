import { IsString, IsOptional, IsBoolean, IsObject, IsNumber } from 'class-validator';

export class WebhookDto {
  @IsString()
  patientId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string;

  @IsOptional()
  @IsString()
  sender?: string;

  @IsOptional()
  @IsBoolean()
  requiresResponse?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ChatMessageDto {
  @IsString()
  patientId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: string;

  @IsOptional()
  @IsString()
  sender?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ChatbotConfigDto {
  @IsString()
  n8nWebhookUrl: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class ChatbotStatsDto {
  @IsNumber()
  totalMessages: number;

  @IsNumber()
  activePatients24h: number;

  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  lastUpdate: string;
}
