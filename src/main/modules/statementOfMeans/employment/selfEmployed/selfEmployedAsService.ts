import {getCaseDataFromStore, saveDraftClaim} from '../../../draft-store/draftStoreService';
import {SelfEmployedAs} from '../../../../common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAs';
import {Claim} from '../../../../common/models/claim';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getSelfEmployedAsForm = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.selfEmployedAs) {
      const selfEmployedAs = claim.statementOfMeans.selfEmployedAs;
      return new SelfEmployedAs(selfEmployedAs.jobTitle, selfEmployedAs.annualTurnover);
    }
    return new SelfEmployedAs();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveSelfEmployedAsData = async (claimId: string, form: SelfEmployedAs) => {
  try {
    const claim = await getClaim(claimId);
    claim.statementOfMeans.selfEmployedAs = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  let claim = await getCaseDataFromStore(claimId);
  if (!claim) {
    claim = new Claim();
  }
  if (!claim.statementOfMeans) {
    claim.statementOfMeans = new StatementOfMeans();
  }
  return claim;
};

export {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
};

