// src/main/services/features/caseProgression/hearingFee/makePaymentAgainService.ts
import {AppRequest} from 'models/AppRequest';
import {getRedirectUrlCommon} from './paymentServiceUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('MakePaymentAgainService');

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  try {
    return await getRedirectUrlCommon(claimId, req);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
