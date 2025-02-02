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
  private vonage: Vonage;

  constructor() {
    const privateKeyPath = resolve(process.env.VONAGE_PRIVATE_KEY as string);
    const auth = new Auth({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      applicationId: process.env.VONAGE_APPLICATION_ID as string,
      privateKey: readFileSync(privateKeyPath).toString(),
    });

    this.vonage = new Vonage(auth);
  }

  async initiateCall(to: string) {
    const callData = {
      to: [{ type: 'phone', number: to as string }],
      from: { type: 'phone', number: process.env.VONAGE_CALLER_ID as string },
      style: 2,
      ncco: [
        {
          action: 'talk',
          text: "Hello, this is RT Demo Emergency Department calling about your recent visit. If this is Jane Smith, press 1. If not, press 2. If we have reached the incorrect household, press 3"
        },
        {
          action: "input",
          eventUrl: [
            "https://tuan-local.ap.ngrok.io/vonage/dtmf?questionId=1"
          ],
          type: [ "dtmf"],
          dtmf: {
            maxDigits: 1
          }
        },
        {
          action: 'talk',
          text: "Great! We would appreciate feedback about your recent visit to RT Demo Emergency Department on November 30. There are only a few brief questions and your responses will help us to improve the quality of care that we provide. We value all feedback and may share patient comments anonymously online. Let’s get started"
        },
        {
          action: 'talk',
          text: "Were you seen by a care provider in a timely manner? Please press 1 for No, 2 for Yes somewhat, 3 for Yes mostly, 4 for Yes definitely."
        },
        {
          action: "input",
          eventUrl: [
            "https://tuan-local.ap.ngrok.io/vonage/dtmf?questionId=2"
          ],
          type: [ "dtmf"],
          dtmf: {
            maxDigits: 1
          }
        },
        {
          action: 'talk',
          text: "Did the care providers explain things in a way you could understand? Please press 1 for No, 2 for Yes somewhat, 3 for Yes mostly, 4 for Yes definitely."
        },
        {
          action: "input",
          eventUrl: [
            "https://tuan-local.ap.ngrok.io/vonage/dtmf?questionId=3"
          ],
          type: [ "dtmf"],
          dtmf: {
            maxDigits: 1
          }
        },
        {
          action: "talk",
          text: "Thank you for your feedback. Thank you, goodbye."
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
}
