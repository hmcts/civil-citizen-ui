import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';
import {
  PriorityDebts,
} from '../../common/form/models/statementOfMeans/priorityDebts';
import {convertToForm} from '../../common/utils/priorityDebts/priorityDebtsConvertors'; 

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('priorityDebtsSerice');

export const getPriorityDebts = async (
  claimId: string,
): Promise<PriorityDebts> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.priorityDebts) {
      return convertToForm(claim.statementOfMeans.priorityDebts);
    }
    return new PriorityDebts();
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

export const savePriorityDebts = async (
  claimId: string,
  form: PriorityDebts,
) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.priorityDebts = form;

    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

