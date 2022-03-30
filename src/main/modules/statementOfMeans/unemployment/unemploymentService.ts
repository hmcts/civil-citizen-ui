import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Unemployment} from '../../../common/form/models/statementOfMeans/unemployment/unemployment';

//import {convertFromForm, convertToForm} from './employmentConverter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getUnemployment = async (claimId: string): Promise<Unemployment> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim && claim.statementOfMeans && claim.statementOfMeans.unemployment) {
      return claim.statementOfMeans.unemployment;
    }
    return new Unemployment();
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
};

export const saveUnemployment = async (claimId: string, unemployment: Unemployment) => {
  try {
    const case_data = await getCaseDataFromStore(claimId) || new Claim();
    if (case_data && case_data.statementOfMeans) {
      case_data.statementOfMeans.unemployment = unemployment;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.unemployment = unemployment;
      case_data.statementOfMeans = statementOfMeans;
    }
    await saveDraftClaim(claimId, case_data);
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
};
