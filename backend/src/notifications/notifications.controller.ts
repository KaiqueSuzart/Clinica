import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AutoNotificationsService } from './auto-notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly autoNotificationsService: AutoNotificationsService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  create(@Body() createNotificationDto: CreateNotificationDto, @EmpresaId() empresaId: string) {
    return this.notificationsService.create(createNotificationDto, empresaId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  findAll(
    @EmpresaId() empresaId: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.findAll(
      empresaId,
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('unread')
  @ApiOperation({ summary: 'Listar notificações não lidas' })
  @ApiResponse({ status: 200, description: 'Lista de notificações não lidas' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  findUnread(@EmpresaId() empresaId: string, @Query('userId') userId?: string) {
    return this.notificationsService.findUnread(empresaId, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de notificações' })
  @ApiResponse({ status: 200, description: 'Estatísticas de notificações' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  getStats(@EmpresaId() empresaId: string, @Query('userId') userId?: string) {
    return this.notificationsService.getStats(empresaId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notificação por ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  findOne(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.notificationsService.findOne(id, empresaId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 204, description: 'Notificação marcada como lida' })
  markAsRead(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.notificationsService.markAsRead(id, empresaId);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações marcadas como lidas' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  markAllAsRead(@EmpresaId() empresaId: string, @Query('userId') userId?: string) {
    return this.notificationsService.markAllAsRead(empresaId, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar notificação' })
  @ApiResponse({ status: 200, description: 'Notificação atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @EmpresaId() empresaId: string) {
    return this.notificationsService.update(id, updateNotificationDto, empresaId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar notificação' })
  @ApiResponse({ status: 204, description: 'Notificação deletada com sucesso' })
  remove(@Param('id') id: string, @EmpresaId() empresaId: string) {
    return this.notificationsService.delete(id, empresaId);
  }

  @Post('auto-check')
  @ApiOperation({ summary: 'Executar verificação automática de notificações' })
  @ApiResponse({ status: 200, description: 'Verificação executada com sucesso' })
  runAutoCheck(@EmpresaId() empresaId: string) {
    return this.autoNotificationsService.runAutoChecks(empresaId);
  }

  @Get('check/upcoming-appointments')
  @ApiOperation({ summary: 'Verificar consultas próximas (1 hora)' })
  @ApiResponse({ status: 200, description: 'Consultas próximas verificadas' })
  checkUpcomingAppointments(@EmpresaId() empresaId: string) {
    return this.autoNotificationsService.checkUpcomingAppointments(empresaId);
  }

  @Get('check/upcoming-returns')
  @ApiOperation({ summary: 'Verificar retornos próximos (1 dia)' })
  @ApiResponse({ status: 200, description: 'Retornos próximos verificados' })
  checkUpcomingReturns(@EmpresaId() empresaId: string) {
    return this.autoNotificationsService.checkUpcomingReturns(empresaId);
  }
}
