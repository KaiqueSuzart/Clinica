import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  is_read?: boolean;
  read_at?: string;
}
