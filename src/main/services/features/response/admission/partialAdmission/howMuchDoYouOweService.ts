import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PartialAdmission} from 'models/partialAdmission';
import {getInterestData} from 'common/utils/interestUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('howMuchDoYouOweService');

export const getHowMuchDoYouOweForm = async (claimId: string, lang: string): Promise<HowMuchDoYouOwe> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const claimHasInterest = claim.hasInterest();
    const interestDetails = claimHasInterest ? await getInterestData(claim, lang) : undefined;
    const interestAmount = (interestDetails ? Number(interestDetails.interestToDate) : undefined);
    let totalClaimAmount = claim.totalClaimAmount;
    if(totalClaimAmount && interestAmount) {
      totalClaimAmount = totalClaimAmount + interestAmount;
    }
    if (claim.partialAdmission?.howMuchDoYouOwe?.amount) {
      const admittedAmount = claim.partialAdmission.howMuchDoYouOwe.amount;
      return new HowMuchDoYouOwe(admittedAmount, totalClaimAmount);
    }
    return new HowMuchDoYouOwe(undefined, totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHowMuchDoYouOweData = async (claimId: string, form: HowMuchDoYouOwe) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }
    claim.partialAdmission.howMuchDoYouOwe = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

