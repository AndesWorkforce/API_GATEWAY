import { Module } from '@nestjs/common';

import { ApplicationsController } from './applications.controller';
import { DomainsController } from './domains.controller';

@Module({
  imports: [],
  controllers: [ApplicationsController, DomainsController],
})
export class ApplicationsModule {}
