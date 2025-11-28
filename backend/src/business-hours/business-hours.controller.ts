import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { BusinessHoursService, BusinessHours } from './business-hours.service';
import { EmpresaId } from '../auth/decorators/empresa.decorator';

@Controller('business-hours')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Get()
  async getBusinessHours(@EmpresaId() empresaId: string): Promise<BusinessHours> {
    return this.businessHoursService.getBusinessHours(empresaId);
  }

  @Put()
  async updateBusinessHours(@Body() businessHours: BusinessHours, @EmpresaId() empresaId: string): Promise<BusinessHours> {
    return this.businessHoursService.updateBusinessHours(empresaId, businessHours);
  }
}
