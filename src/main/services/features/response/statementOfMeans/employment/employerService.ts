import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {Employer} from '../../../../../common/form/models/statementOfMeans/employment/employer';
import {Employers} from '../../../../../common/form/models/statementOfMeans/employment/employers';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmployers = async (claimId: string): Promise<Employers> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.statementOfMeans?.employers?.rows.length) {
      const employers = claim.statementOfMeans.employers.rows.map(employer => new Employer(employer.employerName, employer.jobTitle));
      return new Employers(employers);
    }
    return new Employers([new Employer()]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveEmployers = async (claimId: string, employers: Employers) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const filteredEmployers: Employers = filterEmptyEmployers(employers);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.employers = filteredEmployers;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const filterEmptyEmployers = (employers: Employers) => {
  return new Employers(
    employers.rows
      .filter(employer => employer.employerName !== '' && employer.jobTitle !== '')
      .map(employer => new Employer(employer.employerName, employer.jobTitle)),
  );
};
