import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { BusinessHoursService, BusinessHours } from './business-hours.service';

@Controller('business-hours')
export class BusinessHoursController {
  constructor(private readonly businessHoursService: BusinessHoursService) {}

  @Get()
  async getBusinessHours(): Promise<BusinessHours> {
    return this.businessHoursService.getBusinessHours();
  }

  @Put()
  async updateBusinessHours(@Body() businessHours: BusinessHours): Promise<BusinessHours> {
    return this.businessHoursService.updateBusinessHours('00000000-0000-0000-0000-000000000001', businessHours);
  }
}
