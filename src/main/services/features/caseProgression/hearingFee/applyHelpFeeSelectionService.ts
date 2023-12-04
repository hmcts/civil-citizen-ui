import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {APPLY_HELP_WITH_FEES_START} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getFeePaymentRedirectInformation} from 'services/features/feePayment/feePaymentService';
import {FeeType} from 'form/models/helpWithFees/feeType';


const paymentInformation = 'paymentInformation';
const hearing = 'hearing';
const hearingFeeHelpSelection = 'hearingFeeHelpSelection';

export const getRedirectUrl = async (claimId: string, IsApplyHelpFeeModel: GenericYesNo, req: AppRequest): Promise<string> => {
  const redisClaimId = generateRedisKey(<AppRequest>req);
  let redirectUrl;
  let paymentRedirectInformation;
  if (IsApplyHelpFeeModel.option === YesNo.NO) {
    paymentRedirectInformation = await getFeePaymentRedirectInformation(claimId, FeeType.HEARING, req);
    redirectUrl = paymentRedirectInformation?.nextUrl;
  } else {
    redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START);
  }
  await saveCaseProgression(redisClaimId, paymentRedirectInformation, paymentInformation, hearing);
  await saveCaseProgression(redisClaimId, IsApplyHelpFeeModel, hearingFeeHelpSelection);
  return redirectUrl;
};
