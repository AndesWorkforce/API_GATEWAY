import { Controller, Post, Body, Inject, Get, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { catchError } from 'rxjs';

import { envs, getMessagePattern } from 'config';

import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Throttle({
    default: {
      limit: envs.throttle.auth.register.limit,
      ttl: envs.throttle.auth.register.ttl,
    },
  })
  @Public()
  @Post('register/user')
  registerUser(@Body() registerDto: any) {
    return this.client
      .send(getMessagePattern('auth.register.user'), registerDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Throttle({
    default: {
      limit: envs.throttle.auth.register.limit,
      ttl: envs.throttle.auth.register.ttl,
    },
  })
  @Public()
  @Post('register/client')
  registerClient(@Body() registerDto: any) {
    return this.client
      .send(getMessagePattern('auth.register.client'), registerDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Throttle({
    default: {
      limit: envs.throttle.auth.login.limit,
      ttl: envs.throttle.auth.login.ttl,
    },
  })
  @Public()
  @Post('login')
  login(@Body() loginDto: any) {
    return this.client.send(getMessagePattern('auth.login'), loginDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Throttle({
    default: {
      limit: envs.throttle.auth.refresh.limit,
      ttl: envs.throttle.auth.refresh.ttl,
    },
  })
  @Public()
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: any) {
    return this.client
      .send(getMessagePattern('auth.refresh-token'), refreshTokenDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Throttle({
    default: {
      limit: envs.throttle.auth.refresh.limit,
      ttl: envs.throttle.auth.refresh.ttl,
    },
  })
  @Public()
  @Post('logout')
  logout(@Body() logoutDto: any) {
    return this.client.send(getMessagePattern('auth.logout'), logoutDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Throttle({
    default: {
      limit: envs.throttle.auth.refresh.limit,
      ttl: envs.throttle.auth.refresh.ttl,
    },
  })
  @Public()
  @Get('validate')
  validateToken(@Query('token') token: string) {
    return this.client.send(getMessagePattern('auth.validate'), { token }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
