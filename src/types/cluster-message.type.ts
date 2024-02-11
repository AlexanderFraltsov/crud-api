import { EClusterMessage } from '../enums';
import { TUser } from '../repository/types';

export type TClusterMessage = { cmd: EClusterMessage, id?: number, users?: TUser[] };
