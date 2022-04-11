import {RegularExpenses} from '../../../common/form/models/statementOfMeans/expenses/regularExpenses';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('regularExpensesService');
const getRegularExpenses = async (claimId: string): Promise<RegularExpenses> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.regularExpenses) {
      return claim.statementOfMeans.regularExpenses;
    }
    return RegularExpenses.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRegularExpenses = async (claimId: string, regularExpenses: RegularExpenses) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.regularExpenses = regularExpenses;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getRegularExpenses,
  saveRegularExpenses,
};
