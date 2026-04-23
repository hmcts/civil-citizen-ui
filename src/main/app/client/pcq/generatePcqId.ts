import * as crypto from 'crypto';

export const generatePcqId = (): string => {
  return crypto.randomUUID();
};
