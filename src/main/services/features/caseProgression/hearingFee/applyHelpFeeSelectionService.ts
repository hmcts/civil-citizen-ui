// src/main/services/features/caseProgression/hearingFee/applyHelpFeeSelectionService.ts
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {APPLY_HELP_WITH_FEES} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRedirectUrlCommon} from './paymentServiceUtils';
import {getClaimById} from 'modules/utilityService';
import {FeeType} from 'form/models/helpWithFees/feeType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ApplyHelpFeeSelectionService');

const hearingFeeHelpSelection = 'hearingFeeHelpSelection';

export const getRedirectUrl = async (claimId: string, IsApplyHelpFeeModel: GenericYesNo, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    if (IsApplyHelpFeeModel.option === YesNo.NO) {
      redirectUrl = await getRedirectUrlCommon(claimId, req);
    } else {
      redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES);
    }

    await saveCaseProgression(req, IsApplyHelpFeeModel, hearingFeeHelpSelection);
    const claim = await getClaimById(claimId, req, true);
    claim.feeTypeHelpRequested = FeeType.HEARING;
    await saveDraftClaim(generateRedisKey(req), claim);
    return redirectUrl;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
