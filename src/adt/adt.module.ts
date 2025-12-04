import { Module } from '@nestjs/common';

import { AdtController } from './adt.controller';

@Module({
  imports: [],
  controllers: [AdtController],
})
export class AdtModule {}
