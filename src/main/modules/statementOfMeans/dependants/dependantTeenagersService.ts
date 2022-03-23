import {DependantTeenagers} from 'common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantTeenagersService');
export const saveToDraftStore = async (claimId: string, form: DependantTeenagers) => {
  try {
    const claim = await getClaim(claimId);
    const statementOfMeans = claim.getStatementOfMeans();
    statementOfMeans.numberOfChildrenLivingWithYou = form.value;
    claim.statementOfMeans = statementOfMeans;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  let claim = new Claim();
  try {
    claim = await getCaseDataFromStore(claimId);
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
  return claim;
};
