import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {APPLY_HELP_WITH_FEES} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('hearingFeeHelpSelectionService');

const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const hearingFeeHelpSelection = 'hearingFeeHelpSelection';

export const getRedirectUrl = async (claimId: string, IsApplyHelpFeeModel: GenericYesNo, req: AppRequest): Promise<string> => {
  try{
    const redisClaimId = generateRedisKey(req);
    let redirectUrl;
    let paymentRedirectInformation;
    if (IsApplyHelpFeeModel.option === YesNo.NO) {
      paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.HEARING, req);
      redirectUrl = paymentRedirectInformation?.nextUrl;
      await saveUserId(claimId, req.session.user.id);
    } else {
      redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES);
    }
    await saveCaseProgression(req, paymentRedirectInformation, paymentInformation, hearing);
    await saveCaseProgression(req, IsApplyHelpFeeModel, hearingFeeHelpSelection);
    const claim: Claim = await getClaimById(claimId, req, true);
    claim.feeTypeHelpRequested = FeeType.HEARING;
    await saveDraftClaim(redisClaimId, claim);
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
