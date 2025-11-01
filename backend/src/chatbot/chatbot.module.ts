import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotDataController } from './chatbot-data.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotDataService } from './chatbot-data.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ChatbotController, ChatbotDataController],
  providers: [ChatbotService, ChatbotDataService],
  exports: [ChatbotService, ChatbotDataService]
})
export class ChatbotModule {}
