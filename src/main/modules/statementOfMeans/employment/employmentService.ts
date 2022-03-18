import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {EmploymentStatus} from '../../../common/form/models/statementOfMeans/employment/employmentStatus';

import {convertFromForm, convertToForm} from './employmentConverter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmploymentForm = async (claimId: string): Promise<EmploymentStatus> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim && claim.statementOfMeans && claim.statementOfMeans.employment) {
      return convertToForm(claim.statementOfMeans.employment);
    }
    return new EmploymentStatus();
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
};

export const saveEmploymentData = async (claimId: string, form: EmploymentStatus) => {
  const claim = await getCaseDataFromStore(claimId);
  updateEmployment(claim, form);
  await saveDraftClaim(claimId, claim);

};

const updateEmployment = (claim: Claim, form: EmploymentStatus) => {
  if (claim === undefined || claim === null) {
    claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
  }
  claim.statementOfMeans.employment = convertFromForm(form);
};
