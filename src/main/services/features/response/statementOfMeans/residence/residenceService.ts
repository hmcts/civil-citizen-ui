import {
  getCaseDataFromStore,
  saveDraftClaim,
} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Residence} from '../../../../../common/form/models/statementOfMeans/residence/residence';
import {ResidenceType} from '../../../../../common/form/models/statementOfMeans/residence/residenceType';
import {Claim} from '../../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('residenceService');

const getResidence = async(claimId: string): Promise<Residence> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.residence) {
      return claim.statementOfMeans.residence;
    }
    return new Residence();
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    throw error;
  }
};

const getResidenceForm = (type: ResidenceType, housingDetails: string): Residence => {
  const residence = new Residence(type, housingDetails);
  if (!residence.isResidenceTypeOther()) {
    residence.housingDetails = '';
  }
  return residence;
};

const saveResidence = async(claimId: string, residence: Residence) => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);

    if (claim?.statementOfMeans) {
      claim.statementOfMeans.residence = residence;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.residence = residence;
      claim.statementOfMeans = statementOfMeans;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    throw error;
  }
};

export {
  getResidence,
  saveResidence,
  getResidenceForm,
};
