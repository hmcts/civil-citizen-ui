import {Carer} from '../../common/form/models/statementOfMeans/carer';
import {getCaseDataFromStore, saveDraftClaim} from '../draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('carerService');

export const getCarer = async (claimId: string) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data.statementOfMeans?.carer) {
      const carer = new Carer();
      carer.option = case_data.statementOfMeans.carer.option;
      return carer;
    }
    return new Carer();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCarer = async (claimId: string, carer: Carer) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data.statementOfMeans) {
      case_data.statementOfMeans.carer = carer;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.carer = carer;
      case_data.statementOfMeans = statementOfMeans;
    }
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
