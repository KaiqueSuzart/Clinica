import { Module } from '@nestjs/common';
import { AnamneseService } from './anamnese.service';
import { AnamneseController } from './anamnese.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AnamneseController],
  providers: [AnamneseService],
  exports: [AnamneseService],
})
export class AnamneseModule {}
