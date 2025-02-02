import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { VonageModule } from './vonage/vonage.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Loads .env file
    VonageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
