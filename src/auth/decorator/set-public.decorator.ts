import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const SetPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
