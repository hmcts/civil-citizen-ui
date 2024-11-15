import {AppRequest} from 'models/AppRequest';

import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  PAY_HEARING_FEE_SUCCESSFUL_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PaymentConfirmationService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const success = 'Success';
const failed = 'Failed';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, req: AppRequest): Promise<string> => {
  logger.info(`getRedirectUrl called with claimId: ${claimId}`);
  try {
    logger.info(`Fetching claim by id: ${claimId}`);
    const claim: Claim = await getClaimById(claimId, req, true);
    logger.info(`Claim fetched: ${JSON.stringify(claim)}`);

    const paymentInfo = claim.caseProgression.hearing.paymentInformation;
    logger.info(`Payment information: ${JSON.stringify(paymentInfo)}`);

    logger.info(`Fetching payment status for claimId: ${claimId}, paymentReference: ${paymentInfo.paymentReference}`);
    const paymentStatus = await getFeePaymentStatus(claimId, paymentInfo.paymentReference, FeeType.HEARING, req);
    logger.info(`Payment status fetched: ${JSON.stringify(paymentStatus)}`);

    paymentInfo.status = paymentStatus.status;
    paymentInfo.errorCode = paymentStatus.errorCode;
    paymentInfo.errorDescription = paymentStatus.errorDescription;
    logger.info(`Updated payment information: ${JSON.stringify(paymentInfo)}`);

    logger.info(`Saving case progression for claimId: ${claimId}`);
    await saveCaseProgression(req, paymentInfo, paymentInformation, hearing);
    logger.info(`Case progression saved for claimId: ${claimId}`);

    if (paymentStatus.status === success) {
      logger.info(`Payment successful for claimId: ${claimId}`);
      return PAY_HEARING_FEE_SUCCESSFUL_URL;
    } else if (paymentStatus.status === failed && paymentStatus.errorDescription !== paymentCancelledByUser) {
      logger.info(`Payment failed for claimId: ${claimId}, errorDescription: ${paymentStatus.errorDescription}`);
      return PAY_HEARING_FEE_UNSUCCESSFUL_URL;
    }
    logger.info(`Payment cancelled by user for claimId: ${claimId}`);
    return HEARING_FEE_APPLY_HELP_FEE_SELECTION;
  } catch (error) {
    logger.error(`Error in getRedirectUrl for claimId: ${claimId}`, error);
    throw error;
  }
};
