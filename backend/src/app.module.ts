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
import { FilesModule } from './files/files.module';
import { ReturnsModule } from './returns/returns.module';
import { BusinessHoursModule } from './business-hours/business-hours.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TestController } from './test.controller';

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
    FilesModule,
    ReturnsModule,
    BusinessHoursModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
