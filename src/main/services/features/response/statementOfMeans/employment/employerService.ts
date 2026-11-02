import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Employer} from 'common/form/models/statementOfMeans/employment/employer';
import {Employers} from 'common/form/models/statementOfMeans/employment/employers';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export const getEmployers = async (req: AppRequest): Promise<Employers> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

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

export const saveEmployers = async (req: AppRequest, employers: Employers) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[employerService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    const filteredEmployers: Employers = filterEmptyEmployers(employers);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.employers = filteredEmployers;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
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
