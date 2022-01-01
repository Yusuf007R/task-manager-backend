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

  getMaxAndMinTimeOfDate(date: Date) {
    const dateMin = new Date(date.getTime());
    dateMin.setHours(0, 0, 0, 0);
    const dateMax = new Date(dateMin);
    dateMax.setHours(23, 59, 59, 999);
    return { dateMin, dateMax };
  }
}
