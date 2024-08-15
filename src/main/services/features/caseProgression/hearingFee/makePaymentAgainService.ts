import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('MakePaymentAgainService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
export const getRedirectUrl = async (claimId: string,  req: AppRequest): Promise<string> => {
  try{
    const paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.HEARING, req);
    await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
    return paymentRedirectInformation?.nextUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
