import {getCaseDataFromStore, saveDraftClaim} from '../../../draft-store/draftStoreService';
import {SelfEmployedAsForm} from '../../../../common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {Claim} from '../../../../common/models/claim';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getSelfEmployedAsForm = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.selfEmployedAs) {
      const selfEmployedAs = claim.statementOfMeans.selfEmployedAs;
      return new SelfEmployedAsForm(selfEmployedAs.jobTitle, selfEmployedAs.annualTurnover);
    }
    return new SelfEmployedAsForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveSelfEmployedAsData = async (claimId: string, form: SelfEmployedAsForm) => {
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
  let claim = await getCaseDataFromStore(claimId) || new Claim();
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

