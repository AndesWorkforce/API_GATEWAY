import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
