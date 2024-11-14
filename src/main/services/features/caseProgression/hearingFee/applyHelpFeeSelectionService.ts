import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  APPLY_HELP_WITH_FEES,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_PAYMENT_CONFIRMATION_URL,
} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getFeePaymentRedirectInformation, getFeePaymentStatus} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimById} from 'modules/utilityService';

import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';
import {PaymentInformation} from 'models/feePayment/paymentInformation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('hearingFeeHelpSelectionService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const hearingFeeHelpSelection = 'hearingFeeHelpSelection';
const success = 'Success';
const failed = 'Failed';

export const getRedirectUrl = async (claimId: string, IsApplyHelpFeeModel: GenericYesNo, req: AppRequest): Promise<string> => {
  try {
    const redisClaimId = generateRedisKey(req);
    let redirectUrl;
    let paymentRedirectInformation: PaymentInformation;
    let claim = await getCaseDataFromStore(redisClaimId);

    if (IsApplyHelpFeeModel.option === YesNo.NO) {
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
    } else {
      redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES);
    }

    await saveCaseProgression(req, IsApplyHelpFeeModel, hearingFeeHelpSelection);
    claim = await getClaimById(claimId, req, true);
    claim.feeTypeHelpRequested = FeeType.HEARING;
    await saveDraftClaim(redisClaimId, claim);
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
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

