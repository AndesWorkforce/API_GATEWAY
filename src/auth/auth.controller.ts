import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: any) {
    return this.client.send('auth.register', registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: any) {
    return this.client.send('auth.login', loginDto);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: any) {
    return this.client.send('auth.refresh-token', refreshTokenDto);
  }

  @Post('logout')
  logout(@Body() logoutDto: any) {
    return this.client.send('auth.logout', logoutDto);
  }

  @Public()
  @Get('validate')
  validateToken(@Query('token') token: string) {
    return this.client.send('auth.validate', { token });
  }
}
