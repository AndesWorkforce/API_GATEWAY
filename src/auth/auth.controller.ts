import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {
    console.log(
      'AuthController - Cliente AUTH_SERVICE inyectado:',
      !!this.client,
    );
    console.log('AuthController - Configuración NATS:', {
      host: process.env.NATS_HOST,
      port: process.env.NATS_PORT,
      username: process.env.NATS_USERNAME,
      password: process.env.NATS_PASSWORD ? '***' : 'undefined',
    });
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: any) {
    console.log('AuthController - Enviando registro a auth-ms:', registerDto);
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
