import { IsString, IsOptional, IsUUID, IsEnum, IsObject, IsDateString } from 'class-validator';

export enum NotificationType {
  APPOINTMENT = 'appointment',
  RETURN = 'return',
  MESSAGE = 'message',
  CONFIRMATION = 'confirmation',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
