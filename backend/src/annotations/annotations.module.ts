import { Module } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { AnnotationsController } from './annotations.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
  exports: [AnnotationsService],
})
export class AnnotationsModule {}








