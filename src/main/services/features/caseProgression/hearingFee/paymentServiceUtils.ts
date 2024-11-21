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
  let redirectUrl;
  let paymentRedirectInformation: PaymentInformation;
  const claim = await getCaseDataFromStore(redisClaimId);
  paymentRedirectInformation = claim.caseProgression?.hearing?.paymentInformation || await getRedirectInformation(req);
  logger.info(`Payment redirect information for claimId: ${claimId}: ${JSON.stringify(paymentRedirectInformation)}`);

  if (!paymentRedirectInformation) {
    redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
  } else {
    logger.info('redis key before saving the hearing payment ' + redisClaimId);
    await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
    await saveUserId(claimId, req.session.user.id);

    const paymentStatus = await getFeePaymentStatus(claimId, paymentRedirectInformation.paymentReference, FeeType.HEARING, req);
    logger.info(`Existing hearing payment status for claim id ${claimId}, payment reference ${paymentRedirectInformation.paymentReference}: ${paymentStatus?.status}`);

    if (paymentStatus?.status === success) {
      redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CONFIRMATION_URL);
    } else if (paymentStatus?.status === failed) {
      paymentRedirectInformation = await getRedirectInformation(req);
      await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
      logger.info(`New payment ref after failed payment for claim id ${claimId}: ${JSON.stringify(paymentRedirectInformation)}`);
      redirectUrl = paymentRedirectInformation ? paymentRedirectInformation.nextUrl : constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
    } else {
      redirectUrl = paymentRedirectInformation.nextUrl;
    }
  }
  logger.info(`getRedirectUrlCommon completed for claimId: ${claimId}`);
  return redirectUrl;
};

async function getRedirectInformation(req: AppRequest) {
  logger.info(`getRedirectInformation called for claimId: ${req.params.id}`);
  try {
    const redirectInformation = await getFeePaymentRedirectInformation(req.params.id, FeeType.HEARING, req);
    return redirectInformation;
  } catch (error) {
    logger.error(`Error fetching redirect information for claimId: ${req.params.id}`, error);
    const claim = await getClaimById(req.params.id, req, true);
    claim.paymentSyncError = true;
    await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    return null;
  }
}
