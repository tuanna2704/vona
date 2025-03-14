import { Injectable } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { OutboundCall } from '@vonage/voice';
import * as dotenv from 'dotenv';
import {readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();

@Injectable()
export class VonageService {
  private questionIndex = 0;
  private vonage: Vonage;
  private questions = [
    ['https://vonageapi.dev.nrchealth.com/api/audio/question-123-en.mp3'],
    ['https://vonageapi.dev.nrchealth.com/api/audio/question-234-en.mp3'],
    ['https://vonageapi.dev.nrchealth.com/api/audio/question-456-en.mp3']
  ];

  constructor() {
    const privateKeyPath = resolve(process.env.VONAGE_PRIVATE_KEY as string);
    const auth = new Auth({
      // apiKey: process.env.VONAGE_API_KEY,
      // apiSecret: process.env.VONAGE_API_SECRET,
      applicationId: process.env.VONAGE_APPLICATION_ID as string,
      privateKey: readFileSync(privateKeyPath).toString(),
    });

    this.vonage = new Vonage(auth);
  }

  async initiateCall(to: string) {
    const callData = {
      to: [{ type: 'phone', number: to as string }],
      from: { type: 'phone', number: "12072045218"},
      style: 2,
      advanced_machine_detection: {
        behavior: 'continue',
        mode: 'default',
        beep_timeout: 45
      },
      answerUrl: [`${process.env.APP_BASE_URL}/vonage/answer`],
      ncco: [
        {
          action: 'stream',
          streamUrl: ['https://vonageapi.dev.nrchealth.com/api/audio/cam-di-ngu.mp3']
          // action: 'talk',
          // text: 'Hello, My name is Vonage, I call to collect some your information. Press 1 to continue, press 2 to drop the call.'
        },
        {
          action: 'input',
          eventUrl: [`${process.env.APP_BASE_URL}/vonage/input`],
          maxDigits: 1
        }
      ],
    } as OutboundCall;

    try {
      const response = await this.vonage.voice.createOutboundCall(callData);
      console.log('Call initiated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  }

  async getCallData(callId: string): Promise<any> {
    try {
      const response = await this.vonage.voice.getCall(callId);
      return response;
    } catch (error) {
      throw new Error(`Error fetching call data: ${error}`);
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await this.vonage.conversations.getConversation(conversationId);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }
  }

  handleUserInput(dtmf: string) {
    if (dtmf === '2') {
      return [{ action: 'stream', streamUrl: ['https://vonageapi.dev.nrchealth.com/api/audio/closingScript-closingText.mp3'] }];
      // return [{ action: 'talk', text: 'Goodbye! I consider you dont have need for now' }];
    }

    if (this.questionIndex < this.questions.length) {
      return [
        { action: 'stream', streamUrl: this.questions[this.questionIndex++] },
        { action: 'input', eventUrl: [`${process.env.APP_BASE_URL}/vonage/input`], maxDigits: 1 }
        // { action: 'talk', text: this.questions[this.questionIndex++] },
        // { action: 'input', eventUrl: [`${process.env.APP_BASE_URL}/vonage/input`], maxDigits: 1 }
      ];
    }

    // return [{ action: 'talk', text: 'Thank you! Goodbye.' }];
    return [{ action: 'stream', streamUrl: ['https://vonageapi.dev.nrchealth.com/api/audio/camon.mp3'] }];
  }
}
