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
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginação' })
  findAll(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.findAll(
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('unread')
  @ApiOperation({ summary: 'Listar notificações não lidas' })
  @ApiResponse({ status: 200, description: 'Lista de notificações não lidas' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  findUnread(@Query('userId') userId?: string) {
    return this.notificationsService.findUnread(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de notificações' })
  @ApiResponse({ status: 200, description: 'Estatísticas de notificações' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  getStats(@Query('userId') userId?: string) {
    return this.notificationsService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notificação por ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 204, description: 'Notificação marcada como lida' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Todas as notificações marcadas como lidas' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  markAllAsRead(@Query('userId') userId?: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar notificação' })
  @ApiResponse({ status: 200, description: 'Notificação atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar notificação' })
  @ApiResponse({ status: 204, description: 'Notificação deletada com sucesso' })
  remove(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
