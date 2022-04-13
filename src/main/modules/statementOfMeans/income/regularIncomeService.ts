import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

import RegularIncome from '../../../common/form/models/statementOfMeans/expensesAndIncome/regularIncome';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('regularIncomeService');

const getRegularIncome = async (claimId: string): Promise<RegularIncome> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.regularIncome) {
      return claim.statementOfMeans.regularIncome;
    }
    return RegularIncome.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRegularIncome = async (claimId: string, regularIncome: RegularIncome) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.regularIncome = regularIncome;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getRegularIncome,
  saveRegularIncome,
};
