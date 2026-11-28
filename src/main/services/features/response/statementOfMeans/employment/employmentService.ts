import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {EmploymentForm} from 'common/form/models/statementOfMeans/employment/employmentForm';
import {convertFromForm, convertToForm} from './employmentConverter';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmploymentForm = async (req: AppRequest): Promise<GenericForm<EmploymentForm>> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim?.statementOfMeans?.employment) {
      return convertToForm(claim.statementOfMeans.employment);
    }
    return new GenericForm(new EmploymentForm());
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveEmploymentData = async (req: AppRequest, form: GenericForm<EmploymentForm>) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[employmentService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    updateEmployment(claim, form);

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const updateEmployment = (claim: Claim, form: GenericForm<EmploymentForm>) => {
  if (claim === undefined || claim === null) {
    claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
  }
  if (claim.statementOfMeans === undefined) {
    claim.statementOfMeans = new StatementOfMeans();
  }
  claim.statementOfMeans.employment = convertFromForm(form);
};
