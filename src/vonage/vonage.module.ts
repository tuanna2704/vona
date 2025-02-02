import { Module } from '@nestjs/common';
import { VonageService } from './vonage.service';
import { VonageController } from './vonage.controller';

@Module({
  controllers: [VonageController],
  providers: [VonageService],
})
export class VonageModule {}
