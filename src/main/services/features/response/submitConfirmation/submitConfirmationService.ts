import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {buildSubmitStatus, buildNextStepsSection} from './submitConfirmationBuilder/submitConfirmationBuilder';
import {getNextStepsTitle} from './submitConfirmationBuilder/admissionSubmitConfirmationContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitConfirmationService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getSubmitConfirmationContent = (claimId: string, claim: Claim, lang: string): ClaimSummarySection[] => {
  const submitStatusSection = buildSubmitStatus(claimId, claim, lang);
  const nextStepsTitle = getNextStepsTitle(lang);
  const nextStepsSection = buildNextStepsSection(claimId, claim, lang);
  return [submitStatusSection, nextStepsTitle, nextStepsSection].flat();
};

export const getClaimWithExtendedPaymentDeadline = async (claim:Claim, req: AppRequest): Promise<Date> => {
  try {
    if (claim.isFullAdmission() && claim.isFAPaymentOptionPayImmediately()) {
      return await civilServiceClient.calculateExtendedResponseDeadline(claim?.respondent1ResponseDate, 5, <AppRequest>req);
    }
    return undefined;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
