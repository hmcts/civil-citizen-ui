// src/main/services/features/caseProgression/hearingFee/paymentServiceUtils.ts
import {AppRequest} from 'models/AppRequest';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_PAYMENT_CONFIRMATION_URL} from 'routes/urls';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PaymentServiceUtils');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const success = 'Success';
const failed = 'Failed';

export const getRedirectUrlCommon = async (claimId: string, req: AppRequest): Promise<string> => {
  logger.info(`getRedirectUrlCommon called with claimId: ${claimId}`);
  const redisClaimId = generateRedisKey(req);
  logger.info(`Generated redisClaimId: ${redisClaimId}`);
  let redirectUrl;
  let paymentRedirectInformation: PaymentInformation;
  const claim = await getCaseDataFromStore(redisClaimId);
  logger.info(`Fetched claim from store: ${JSON.stringify(claim)}`);
  paymentRedirectInformation = claim.caseProgression?.hearing?.paymentInformation || await getRedirectInformation(req);
  logger.info(`Payment redirect information: ${JSON.stringify(paymentRedirectInformation)}`);

  if (!paymentRedirectInformation) {
    redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
    logger.info(`No paymentRedirectInformation found, redirecting to: ${redirectUrl}`);
  } else {
    logger.info('redis key before saving the hearing payment ' + redisClaimId);
    logger.info('saved redis hearing payment reference ' + paymentRedirectInformation.paymentReference);
    await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
    logger.info(`Saved case progression with payment information: ${JSON.stringify(paymentRedirectInformation)}`);
    await saveUserId(claimId, req.session.user.id);
    logger.info(`Saved userId: ${req.session.user.id} for claimId: ${claimId}`);

    const paymentStatus = await getFeePaymentStatus(claimId, paymentRedirectInformation.paymentReference, FeeType.HEARING, req);
    logger.info(`Existing hearing payment status for claim id ${claimId}, payment reference ${paymentRedirectInformation.paymentReference}: ${paymentStatus?.status}`);

    if (paymentStatus?.status === success) {
      redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CONFIRMATION_URL);
      logger.info(`Payment successful, redirecting to: ${redirectUrl}`);
    } else if (paymentStatus?.status === failed) {
      paymentRedirectInformation = await getRedirectInformation(req);
      await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
      logger.info(`New payment ref after failed payment for claim id ${claimId}: ${paymentRedirectInformation?.paymentReference}`);
      redirectUrl = paymentRedirectInformation ? paymentRedirectInformation.nextUrl : constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
      logger.info(`Payment failed, redirecting to: ${redirectUrl}`);
    } else {
      redirectUrl = paymentRedirectInformation.nextUrl;
      logger.info(`Redirecting to nextUrl: ${redirectUrl}`);
    }
  }
  logger.info(`getRedirectUrlCommon completed for claimId: ${claimId}`);
  return redirectUrl;
};

async function getRedirectInformation(req: AppRequest) {
  logger.info(`getRedirectInformation called for claimId: ${req.params.id}`);
  try {
    const redirectInformation = await getFeePaymentRedirectInformation(req.params.id, FeeType.HEARING, req);
    logger.info(`Fetched redirect information: ${JSON.stringify(redirectInformation)}`);
    return redirectInformation;
  } catch (error) {
    logger.error(`Error fetching redirect information for claimId: ${req.params.id}`, error);
    const claim = await getClaimById(req.params.id, req, true);
    claim.paymentSyncError = true;
    await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    logger.info(`Saved claim with paymentSyncError: ${JSON.stringify(claim)}`);
    return null;
  }
}
