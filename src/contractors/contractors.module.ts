import { Module } from '@nestjs/common';

import { ContractorsController } from './contractors.controller';

@Module({
  imports: [],
  controllers: [ContractorsController],
})
export class ContractorsModule {}
