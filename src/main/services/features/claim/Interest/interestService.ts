import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {Interest} from 'common/form/models/Interest/interest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

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
    if (claim.interest[interestPropertyName]) {
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
