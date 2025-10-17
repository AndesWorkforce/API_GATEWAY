import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Post('register')
  register(@Body() registerDto: any) {
    return this.client.send('auth.register', registerDto);
  }

  @Post('login')
  login(@Body() loginDto: any) {
    return this.client.send('auth.login', loginDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: any) {
    return this.client.send('auth.refresh-token', refreshTokenDto);
  }

  @Post('logout')
  logout(@Body() logoutDto: any) {
    return this.client.send('auth.logout', logoutDto);
  }
}
