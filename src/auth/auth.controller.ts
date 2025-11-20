import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Public()
  @Post('register/user')
  registerUser(@Body() registerDto: any) {
    return this.client.send('auth.register.user', registerDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Post('register/client')
  registerClient(@Body() registerDto: any) {
    return this.client.send('auth.register.client', registerDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: any) {
    return this.client.send('auth.login', loginDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: any) {
    return this.client.send('auth.refresh-token', refreshTokenDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @Public()
  @Post('logout')
  logout(@Body() logoutDto: any) {
    return this.client.send('auth.logout', logoutDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Get('validate')
  validateToken(@Query('token') token: string) {
    return this.client.send('auth.validate', { token }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
