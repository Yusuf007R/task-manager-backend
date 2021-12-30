import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

@Injectable()
export class HelperService {
  generateRandomString(length: number) {
    return customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length)();
  }

  generateDatePlusMins(minutes: number) {
    return new Date(Date.now() + minutes * 60000);
  }
}
