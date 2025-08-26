import { Controller, Get, Post, Patch, Param, Body, Delete } from '@nestjs/common';
import { TreatmentSessionsService, UpdateSessionDto } from './treatment-sessions.service';

@Controller('treatment-sessions')
export class TreatmentSessionsController {
  constructor(private readonly sessionsService: TreatmentSessionsService) {}

  @Post('item/:itemId/create')
  async createSessionsForItem(
    @Param('itemId') itemId: string,
    @Body('numberOfSessions') numberOfSessions: number
  ) {
    return this.sessionsService.createSessionsForItem(itemId, numberOfSessions);
  }

  @Post()
  async createSession(@Body() sessionData: {
    treatment_item_id: string;
    session_number: number;
    date?: string;
    description?: string;
    completed?: boolean;
  }) {
    return this.sessionsService.createSession(sessionData);
  }

  @Patch(':sessionId')
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() updates: UpdateSessionDto
  ) {
    return this.sessionsService.updateSession(sessionId, updates);
  }

  @Get('item/:itemId')
  async getSessionsForItem(@Param('itemId') itemId: string) {
    return this.sessionsService.getSessionsForItem(itemId);
  }

  @Get('patient/:patientId/completed')
  async getCompletedSessionsForPatient(@Param('patientId') patientId: string) {
    return this.sessionsService.getCompletedSessionsForPatient(patientId);
  }

  @Delete('item/:itemId')
  async deleteSessionsForItem(@Param('itemId') itemId: string) {
    await this.sessionsService.deleteSessionsForItem(itemId);
    return { message: 'Sessões removidas com sucesso' };
  }
}
