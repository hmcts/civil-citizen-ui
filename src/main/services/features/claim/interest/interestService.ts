import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Interest} from 'form/models/interest/interest';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('interestService');

const deleteSameRateInterest = (claim: Claim) => {
  delete claim.interest.sameRateInterestSelection;
  delete claim.interest.interestClaimFrom;
  delete claim.interest.interestStartDate;
  delete claim.interest.interestEndDate;
};

const deleteBreakDownInterest = (claim: Claim) => {
  delete claim.interest.totalInterest;
};

const getInterest = async (claimId: string): Promise<Interest> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return Object.assign(new Interest(), caseData.interest);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveInterest = async (claimId: string, value: any, interestPropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.interest) {

      if (claim.interest.interestClaimOptions) {
        if (claim.interest.interestClaimOptions === InterestClaimOptionsType.SAME_RATE_INTEREST) {
          // removing values all values from BREAK_DOWN_INTEREST
          deleteBreakDownInterest(claim);
        } else {
          // removing values all values from SAME_RATE_INTEREST
          deleteSameRateInterest(claim);
        }
      }

      claim.interest[interestPropertyName] = value;
    } else {
      const interest: any = new Interest();
      interest[interestPropertyName] = value;
      claim.interest = interest;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getInterest,
  saveInterest,
};
