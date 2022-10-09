import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {ClaimantInterestRate} from '../../../../common/form/models/claim/interest/claimantInterestRate';
import { Claim } from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimanIterestRateService');

const getInterestRate = async (claimId:string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.sameRateInterestSelection) {
      return new ClaimantInterestRate(
        claim.sameRateInterestSelection.sameRateInterestType,
        claim.sameRateInterestSelection.differentRate,
        claim.sameRateInterestSelection.reason);
    }
    return new ClaimantInterestRate();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveIterestRate = async (claimId:string,form: ClaimantInterestRate) => {
  try {
    const claim = await getClaim(claimId);
    claim.sameRateInterestSelection.sameRateInterestType = form.option;
    claim.sameRateInterestSelection.differentRate = form.rate;
    claim.sameRateInterestSelection.reason = form.reason;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.sameRateInterestSelection) {
    claim.sameRateInterestSelection = {
      sameRateInterestType: null,
      differentRate: undefined,
      reason: '',
    };
  }
  return claim;
};

export {
  getInterestRate,
  saveIterestRate,
};
