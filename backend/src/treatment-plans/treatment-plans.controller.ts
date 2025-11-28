import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto, UpdateProgressDto } from './dto/update-treatment-plan.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Post()
  create(@Body() createTreatmentPlanDto: CreateTreatmentPlanDto, @EmpresaId() empresaId: string) {
    return this.treatmentPlansService.create(createTreatmentPlanDto, empresaId);
  }

  @Get()
  findAll(@EmpresaId() empresaId: string) {
    return this.treatmentPlansService.findAll(empresaId);
  }

  @Get('patient/:patientId')
  findByPatientId(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.treatmentPlansService.findByPatientId(Number(patientId), empresaId);
  }

  @Get('patient/:patientId/progress')
  getPatientProgress(@Param('patientId') patientId: string, @EmpresaId() empresaId: string) {
    return this.treatmentPlansService.getPatientTreatmentProgress(Number(patientId), empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.treatmentPlansService.findOne(id, empresaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentPlanDto: UpdateTreatmentPlanDto,
    @EmpresaId() empresaId: string,
  ) {
    return this.treatmentPlansService.update(id, updateTreatmentPlanDto, empresaId);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @EmpresaId() empresaId: string,
  ) {
    console.log('🎯 [Controller.updateProgress] Recebido:', {
      planId: id,
      progress: updateProgressDto.progress,
      empresaId,
      tipos: {
        planId: typeof id,
        progress: typeof updateProgressDto.progress,
        empresaId: typeof empresaId
      }
    });
    return this.treatmentPlansService.updateProgress(id, updateProgressDto.progress, empresaId);
  }

  @Patch(':planId/items/:itemId/status')
  updateItemStatus(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: string,
    @EmpresaId() empresaId: string,
  ) {
    return this.treatmentPlansService.updateItemStatus(planId, itemId, status, empresaId);
  }

  @Patch(':planId/items/:itemId/sessions/:sessionId')
  updateSession(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Param('sessionId') sessionId: string,
    @Body() updates: any,
    @EmpresaId() empresaId: string,
  ) {
    return this.treatmentPlansService.updateSession(planId, itemId, sessionId, updates, empresaId);
  }

  @Patch('sessions/:sessionId')
  updateSessionDirect(
    @Param('sessionId') sessionId: string,
    @Body() updates: any,
    @EmpresaId() empresaId: string,
  ) {
    console.log('🎯 [Controller.updateSessionDirect] Recebido:', {
      sessionId,
      updates,
      empresaId,
      tipos: {
        sessionId: typeof sessionId,
        empresaId: typeof empresaId
      }
    });
    // Buscar o item da sessão para obter planId e itemId
    return this.treatmentPlansService.updateSessionDirect(sessionId, updates, empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.treatmentPlansService.remove(id, empresaId);
  }

  @Post('setup-sessions-table')
  async setupSessionsTable() {
    return this.treatmentPlansService.setupSessionsTable();
  }

  @Post('populate-existing-sessions')
  async populateExistingSessions() {
    return this.treatmentPlansService.populateExistingSessions();
  }

  @Post('fix-all-progress')
  async fixAllProgress() {
    return this.treatmentPlansService.fixAllProgress();
  }

  @Post('fix-all-completed-sessions')
  async fixAllCompletedSessions() {
    return this.treatmentPlansService.fixAllCompletedSessions();
  }

  @Post('fix-periodontia-session')
  async fixPeriodontiaSession() {
    return this.treatmentPlansService.fixPeriodontiaSession();
  }

  @Get('test')
  async test() {
    try {
      console.log('🔧 Test endpoint chamado');
      return { message: 'Treatment plans endpoint funcionando!', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('❌ Erro no test endpoint:', error);
      return { error: error.message };
    }
  }
}
