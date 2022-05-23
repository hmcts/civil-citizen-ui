import {Explanation} from '../../common/form/models/statementOfMeans/explanation';
import {getCaseDataFromStore, saveDraftClaim} from '../draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('explanationService');

export const getExplanation = async (claimId: string): Promise<Explanation> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.explanation) {
      return claim.statementOfMeans.explanation;
    }
    return new Explanation();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveExplanation = async (claimId: string, explanation: Explanation) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans) {
      claim.statementOfMeans.explanation = explanation;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.explanation = explanation;
      claim.statementOfMeans = statementOfMeans;
    }
    claim.taskSharedFinancialDetails = 'yes';
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
