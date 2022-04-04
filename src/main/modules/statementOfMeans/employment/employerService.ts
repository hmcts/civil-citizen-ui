import { getCaseDataFromStore, saveDraftClaim } from '../../draft-store/draftStoreService';
import { Employer } from '../../../common/form/models/statementOfMeans/employment/employer';
import { Employers } from '../../../common/form/models/statementOfMeans/employment/employers';
import { Claim } from 'common/models/claim';
import { StatementOfMeans } from 'common/models/statementOfMeans';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmployers = async (claimId: string): Promise<Employers> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.employers?.rows?.length) {
      const employers = claim.statementOfMeans.employers.rows.map(employer => new Employer(employer.employerName, employer.jobTitle));
      return new Employers(employers);
    }
    return new Employers([new Employer()]);
  } catch (error) {
    logger.error(error);
  }
};

export const saveEmployers = async (claimId: string, employers: Employers) => {
  let claim = await getCaseDataFromStore(claimId);
  let employersConverted: Employers = new Employers(
    employers.rows
      .filter(employer => employer.employerName !== '' && employer.jobTitle !== '')
      .map(employer => new Employer(employer.employerName, employer.jobTitle))
  );
  // employersConverted.getOnlyCompletedAccounts();

  if (claim === undefined) {
    claim = new Claim();
  }
  if (claim.statementOfMeans) {
    claim.statementOfMeans.employers = employersConverted;
  } else {
    const statementOfMeans = new StatementOfMeans();
    statementOfMeans.employers = employersConverted;
    claim.statementOfMeans = statementOfMeans;
  }
  await saveDraftClaim(claimId, claim);
}
