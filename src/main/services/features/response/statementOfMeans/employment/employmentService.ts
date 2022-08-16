import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../../common/models/claim';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {EmploymentForm} from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';
import {convertFromForm, convertToForm} from './employmentConverter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmploymentForm = async (claimId: string): Promise<GenericForm<EmploymentForm>> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.employment) {
      return convertToForm(claim.statementOfMeans.employment);
    }
    return new GenericForm(new EmploymentForm());
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveEmploymentData = async (claimId: string, form: GenericForm<EmploymentForm>) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    updateEmployment(claim, form);
    await saveDraftClaim(claimId, claim);
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
