import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Residence} from 'common/form/models/statementOfMeans/residence/residence';
import {ResidenceType} from 'common/form/models/statementOfMeans/residence/residenceType';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('residenceService');

const getResidence = async(req: AppRequest): Promise<Residence> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
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

const saveResidence = async(req: AppRequest, residence: Residence) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[residenceService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (claim?.statementOfMeans) {
      claim.statementOfMeans.residence = residence;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.residence = residence;
      claim.statementOfMeans = statementOfMeans;
    }
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
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
