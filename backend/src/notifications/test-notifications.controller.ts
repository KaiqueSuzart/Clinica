import { Controller, Get } from '@nestjs/common';

@Controller('test-notifications')
export class TestNotificationsController {
  @Get()
  test() {
    return { message: 'Test notifications controller is working!' };
  }
}
