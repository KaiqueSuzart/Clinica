import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { AnamneseModule } from './anamnese/anamnese.module';
import { AnnotationsModule } from './annotations/annotations.module';
import { TreatmentPlansModule } from './treatment-plans/treatment-plans.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    SupabaseModule,
    PatientsModule,
    AppointmentsModule,
    AuthModule,
    EvaluationsModule,
    AnamneseModule,
    AnnotationsModule,
    TreatmentPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
