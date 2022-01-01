import { IdToUserPipe } from '../pipe/load-user.pipe';
import { GetUserId } from './get-user-id.decorator';

export const GetUser = (additionalOptions?: any) =>
  GetUserId(additionalOptions, IdToUserPipe);
