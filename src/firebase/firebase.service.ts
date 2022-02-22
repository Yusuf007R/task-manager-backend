import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  private readonly firebaseApp: App;

  constructor(private configService: ConfigService) {
    const firebaseKey = configService.get('FIREBASE_KEY');
    const firebaseJson = Buffer.from(firebaseKey, 'base64').toString();
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(firebaseJson)),
    });
  }

  async sendNewDataNotify(tokens: string[]) {
    console.log(tokens);

    try {
      if (tokens.length === 0) return false;
      const payload: MulticastMessage = {
        data: { type: 'new-data' },
        tokens: tokens,
      };
      console.log(await admin.messaging().sendMulticast(payload));
    } catch (error) {
      console.log(error);
    } finally {
      return true;
    }
  }
}
