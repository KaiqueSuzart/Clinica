import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
import { BudgetsModule } from './budgets/budgets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SupabaseModule } from './supabase/supabase.module';
import { TestController } from './test.controller';
import { TenantMiddleware } from './auth/tenant.middleware';

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
    BudgetsModule,
    NotificationsModule,
    EmpresasModule,
    UsuariosModule,
    SubscriptionsModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware de tenant em todas as rotas exceto auth
    consumer
      .apply(TenantMiddleware)
      .exclude(
        'auth/login',
        'auth/register',
        'auth/register-empresa',
        'auth/logout',
        'test/(.*)',
        'health',
        'docs',
        'api-docs'
      )
      .forRoutes('*');
  }
}
