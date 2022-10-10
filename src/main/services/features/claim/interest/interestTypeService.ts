import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import InterestClaimOption from '../../../../common/form/models/claim/interest/interestClaimOption';
import {InterestClaimOptionsType} from '../../../../common/form/models/claim/interest/interestClaimOptionsType';
import {Claim} from "models/claim";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('interestTypeService');

export const getInterestTypeForm = async (claimId: string): Promise<InterestClaimOption> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isInterestClaimOptionExists()) {
      return new InterestClaimOption(InterestClaimOptionsType[claim.interestClaimOptions as keyof typeof InterestClaimOptionsType]);
    }
    return new InterestClaimOption();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveInterestTypeOption = async (claimId: string, form: InterestClaimOption) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.interestClaimOptions = form.interestType;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
