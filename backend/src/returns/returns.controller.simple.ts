import { Controller, Get } from '@nestjs/common';

@Controller('returns')
export class ReturnsControllerSimple {
  @Get()
  test() {
    return { message: 'Returns controller is working!' };
  }

  @Get('confirmed')
  testConfirmed() {
    return { message: 'Confirmed returns endpoint is working!' };
  }

  @Get('possible')
  testPossible() {
    return { message: 'Possible returns endpoint is working!' };
  }
}




