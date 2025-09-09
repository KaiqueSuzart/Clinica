import { Module } from '@nestjs/common';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { ReturnsServiceSimple } from './returns.service.simple';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReturnsController],
  providers: [
    {
      provide: ReturnsService,
      useClass: ReturnsServiceSimple,
    },
  ],
  exports: [ReturnsService],
})
export class ReturnsModule {}
