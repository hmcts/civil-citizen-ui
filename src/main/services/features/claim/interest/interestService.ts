import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Interest} from '../../../../common/form/models/interest/interest';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('interestService');

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
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.interest) {
      claim.interest[interestPropertyName as keyof Interest] = value;
    } else {
      const interest: Interest = new Interest();
      interest[interestPropertyName as keyof Interest] = value;
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
