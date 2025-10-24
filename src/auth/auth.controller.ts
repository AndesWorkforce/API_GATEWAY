import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { envs } from 'config';

import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {
    console.log(
      'AuthController - Cliente AUTH_SERVICE inyectado:',
      !!this.client,
    );
    console.log('AuthController - Configuración NATS:', {
      host: envs.natsHost,
      port: envs.natsPort,
      username: envs.natsUsername,
      password: envs.natsPassword ? '***' : 'undefined',
    });
  }

  @Public()
  @Post('register/user')
  registerUser(@Body() registerDto: any) {
    console.log(
      'AuthController - Enviando registro de usuario a auth-ms:',
      registerDto,
    );
    return this.client.send('auth.register.user', registerDto);
  }

  @Public()
  @Post('register/client')
  registerClient(@Body() registerDto: any) {
    console.log(
      'AuthController - Enviando registro de cliente a auth-ms:',
      registerDto,
    );
    return this.client.send('auth.register.client', registerDto);
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
