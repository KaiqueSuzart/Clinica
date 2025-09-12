import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TestNotificationsController } from './test-notifications.controller';
import { SimpleNotificationsController } from './simple-notifications.controller';
import { MockNotificationsController } from './mock-notifications.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MockNotificationsController, TestNotificationsController, SimpleNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
