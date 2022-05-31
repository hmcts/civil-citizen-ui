import {Carer} from '../../../../common/form/models/statementOfMeans/carer';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('carerService');

export const getCarer = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.carer) {
      const carer = new Carer();
      carer.option = claim.statementOfMeans.carer.option;
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
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans) {
      claim.statementOfMeans.carer = carer;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.carer = carer;
      claim.statementOfMeans = statementOfMeans;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
