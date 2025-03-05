import { Controller, Post, Body, Req, Res, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { VonageService } from './vonage.service';
import { Request, Response } from 'express';

@Controller('vonage')
export class VonageController {
  constructor(private readonly vonageService: VonageService) {}

  @Post('call')
  async makeCall(@Body('to') to: string) {
    return await this.vonageService.initiateCall(to);
  }

  @Post('input')
  handleInput(@Body() body: any) {
    const dtmf = body.dtmf;
    return this.vonageService.handleUserInput(dtmf);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('Vonage Webhook Event:', req.body);
    res.status(200).send('Webhook received');
  }

  @Post('dtmf')
  async dtmf(@Req() req: Request, @Query('questionId') questionId: number) {
    console.log('Vonage Dtmf Event:', req.body);
    console.log('Question:', questionId);
  }

  @Get('answer')
  getAnswer(@Res() res: Response) {
    console.log('Vonage Answer Event');
    res.json([
      {
        action: 'talk',
        text: 'Hello, this is a call from your NestJS application!',
      },
    ]);
  }

  @Get('fallback')
  getFallbackNcco() {
    console.log('Vonage Fallback Event');
    return [
      {
        action: 'talk',
        text: 'Sorry, there was an issue reaching the main server. Please try again later.',
      },
    ];
  }

  @Get('status/:callId')
  async getCallStatus(@Param('callId') callId: string) {
    if (!callId) {
      throw new HttpException(
        'callId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const callData = await this.vonageService.getCallData(callId);
      return callData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('conversation/:conversationId')
  async getConversation(@Param('conversationId') conversationId: string) {
    if (!conversationId) {
      throw new HttpException(
        'callId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const callData = await this.vonageService.getConversation(conversationId);
      return callData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
