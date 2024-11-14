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
  const redisClaimId = generateRedisKey(req);
  let redirectUrl;
  let paymentRedirectInformation: PaymentInformation;
  const claim = await getCaseDataFromStore(redisClaimId);
  paymentRedirectInformation = claim.caseProgression?.hearing?.paymentInformation || await getRedirectInformation(req);

  if (!paymentRedirectInformation) {
    redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
  } else {
    logger.info('redis key before saving the hearing payment ' + redisClaimId);
    logger.info('saved redis hearing payment reference ' + paymentRedirectInformation.paymentReference);
    await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
    await saveUserId(claimId, req.session.user.id);

    const paymentStatus = await getFeePaymentStatus(claimId, paymentRedirectInformation.paymentReference, FeeType.HEARING, req);
    logger.info(`Existing hearing payment status for claim id ${claimId}: ${paymentStatus?.status}`);

    if (paymentStatus?.status === success) {
      redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CONFIRMATION_URL);
    } else if (paymentStatus?.status === failed) {
      paymentRedirectInformation = await getRedirectInformation(req);
      await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
      logger.info(`New payment ref after failed payment for claim id ${claimId}: ${paymentRedirectInformation?.paymentReference}`);
      redirectUrl = paymentRedirectInformation ? paymentRedirectInformation.nextUrl : constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION);
    } else {
      redirectUrl = paymentRedirectInformation.nextUrl;
    }
  }
  return redirectUrl;
};

async function getRedirectInformation(req: AppRequest) {
  try {
    return await getFeePaymentRedirectInformation(
      req.params.id,
      FeeType.HEARING,
      req,
    );
  } catch (error) {
    const claim = await getClaimById(req.params.id, req, true);
    claim.paymentSyncError = true;
    await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    return null;
  }
}
