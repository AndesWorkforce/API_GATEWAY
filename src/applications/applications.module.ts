import { Module } from '@nestjs/common';

import { ApplicationsController } from './applications.controller';

@Module({
  imports: [],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}

