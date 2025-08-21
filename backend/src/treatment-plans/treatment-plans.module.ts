import { Module } from '@nestjs/common';
import { TreatmentPlansController } from './treatment-plans.controller';
import { TreatmentPlansService } from './treatment-plans.service';
import { TreatmentSessionsController } from './treatment-sessions.controller';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TreatmentPlansController, TreatmentSessionsController],
  providers: [TreatmentPlansService, TreatmentSessionsService],
  exports: [TreatmentPlansService, TreatmentSessionsService],
})
export class TreatmentPlansModule {}
