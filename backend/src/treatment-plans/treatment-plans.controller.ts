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
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';

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
    return this.treatmentPlansService.findByPatientId(patientId);
  }

  @Get('patient/:patientId/progress')
  getPatientProgress(@Param('patientId') patientId: string) {
    return this.treatmentPlansService.getPatientTreatmentProgress(patientId);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentPlansService.remove(id);
  }
}
