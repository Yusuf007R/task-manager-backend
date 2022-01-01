import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  async sendVerificationCode(email: string, code: string) {
    const msg = {
      to: email,
      from: this.configService.get('SEND_GRID_EMAIL'),
      subject: 'Verification Code task manager',
      text: `Your verification code is: ${code}`,
      html: `<strong>Your verification code is: ${code}</strong>`,
    };
    return await SendGrid.send(msg);
  }
}
