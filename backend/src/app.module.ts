import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
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
import { ChatbotModule } from './chatbot/chatbot.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProceduresModule } from './procedures/procedures.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { TestController } from './test.controller';
import { TestDbController } from './test-db.controller';
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
    ChatbotModule,
    ProceduresModule,
    DashboardModule,
    ReportsModule,
    PaymentsModule,
  ],
  controllers: [AppController, TestController, TestDbController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware de tenant em todas as rotas exceto auth e rotas de teste
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/register', method: RequestMethod.ALL },
        { path: 'auth/register-empresa', method: RequestMethod.ALL },
        { path: 'auth/logout', method: RequestMethod.ALL },
        { path: 'test/(.*)', method: RequestMethod.ALL },
        { path: 'test-db/(.*)', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'api-docs', method: RequestMethod.ALL }
      )
      .forRoutes('*');
  }
}
