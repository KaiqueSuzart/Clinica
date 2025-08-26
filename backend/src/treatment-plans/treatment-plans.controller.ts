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

@Controller('treatment-plans')
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Post()
  create(@Body() createTreatmentPlanDto: CreateTreatmentPlanDto) {
    return this.treatmentPlansService.create(createTreatmentPlanDto);
  }

  @Get()
  findAll() {
    return this.treatmentPlansService.findAll();
  }

  @Get('patient/:patientId')
  findByPatientId(@Param('patientId') patientId: string) {
    return this.treatmentPlansService.findByPatientId(Number(patientId));
  }

  @Get('patient/:patientId/progress')
  getPatientProgress(@Param('patientId') patientId: string) {
    return this.treatmentPlansService.getPatientTreatmentProgress(Number(patientId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTreatmentPlanDto: UpdateTreatmentPlanDto,
  ) {
    return this.treatmentPlansService.update(id, updateTreatmentPlanDto);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.treatmentPlansService.updateProgress(id, updateProgressDto.progress);
  }

  @Patch(':planId/items/:itemId/status')
  updateItemStatus(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: string,
  ) {
    return this.treatmentPlansService.updateItemStatus(planId, itemId, status);
  }

  @Patch(':planId/items/:itemId/sessions/:sessionId')
  updateSession(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Param('sessionId') sessionId: string,
    @Body() updates: any,
  ) {
    return this.treatmentPlansService.updateSession(planId, itemId, sessionId, updates);
  }

  @Patch('sessions/:sessionId')
  updateSessionDirect(
    @Param('sessionId') sessionId: string,
    @Body() updates: any,
  ) {
    // Buscar o item da sessão para obter planId e itemId
    return this.treatmentPlansService.updateSessionDirect(sessionId, updates);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentPlansService.remove(id);
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
