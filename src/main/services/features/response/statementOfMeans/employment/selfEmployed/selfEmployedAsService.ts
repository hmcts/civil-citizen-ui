import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {
  SelfEmployedAsForm,
} from 'common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getSelfEmployedAsForm = async (req: AppRequest) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim?.statementOfMeans?.selfEmployedAs) {
      const selfEmployedAs = claim.statementOfMeans.selfEmployedAs;
      return new GenericForm(new SelfEmployedAsForm(selfEmployedAs.jobTitle, selfEmployedAs.annualTurnover));
    }
    return new GenericForm(new SelfEmployedAsForm());
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveSelfEmployedAsData = async (req: AppRequest, form: GenericForm<SelfEmployedAsForm>) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[selfEmployedAsService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.selfEmployedAs = form.model;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
};

