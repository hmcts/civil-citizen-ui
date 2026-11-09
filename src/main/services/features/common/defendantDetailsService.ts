import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {Party} from '../../../common/models/party';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantDetailsService');

export const getDefendantInformation = async (claimId: string): Promise<Party> => {
  const responseData = await getCaseDataFromStore(claimId);
  if (responseData.respondent1) {
    return responseData.respondent1;
  }
  return new Party();
};

export const getDefendantInformationFromDraft = async (req: AppRequest): Promise<Party> => {
  const draftResult = await getDraftClaim(req);
  const claim = Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
  return Object.assign(new Party(), claim.respondent1);
};

export const saveDefendantProperty = async (userId: string, propertyName: string, value: any): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(userId);
    if (claim?.respondent1) {
      claim.respondent1[propertyName as keyof Party] = value;
    } else {
      const claimant = new Party();
      claimant[propertyName as keyof Party] = value;
      claim.respondent1 = claimant;
    }
    await saveDraftClaim(userId, claim, false, userId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDefendantPropertyToDraft = async (req: AppRequest, propertyName: string, value: unknown): Promise<void> => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[defendantDetailsService] no draft claim found to update');
    }
    const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    if (claim.respondent1) {
      (claim.respondent1 as unknown as Record<string, unknown>)[propertyName as keyof Party] = value;
    } else {
      const defendant = new Party();
      (defendant as unknown as Record<string, unknown>)[propertyName as keyof Party] = value;
      claim.respondent1 = defendant;
    }

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
