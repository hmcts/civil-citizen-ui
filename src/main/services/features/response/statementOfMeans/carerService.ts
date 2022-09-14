import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('carerService');

export const getCarer = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.carer) {
      const carer = new GenericYesNo();
      carer.option = claim.statementOfMeans.carer.option;
      return carer;
    }
    return new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCarer = async (claimId: string, carer: GenericYesNo) => {
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
