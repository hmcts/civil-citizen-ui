import {AppRequest} from 'common/models/AppRequest';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {translateDraftClaimToCCDR2} from 'services/translation/claim/ccdTranslation';
import {Email} from 'models/Email';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaim = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const user = (<AppRequest>req).session.user;
    const claim = await getCaseDataFromStore(claimId);
    if (claim.applicant1) {
      claim.applicant1.emailAddress = new Email(user.email);
      await saveDraftClaim(claimId, claim);
    }
    const ccdClaim = translateDraftClaimToCCDR2(claim, req);
    logger.info('masked party no')
    logger.info(maskLastFour(ccdClaim.applicant1.partyPhone));
    logger.info(maskLastFour(ccdClaim.respondent1.partyPhone));
    logger.info(maskEmail(ccdClaim.applicant1.partyEmail));
    logger.info(maskEmail(ccdClaim.respondent1.partyEmail));
    return await civilServiceClient.submitDraftClaim(ccdClaim, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

function maskLastFour(str: string) {
  if (str?.length <= 4) return '*'.repeat(str.length);
  const visiblePart = str?.slice(0, -4);
  const maskedPart = '*'?.repeat(4);
  return visiblePart + maskedPart;
}

function maskEmail(email: string) {
  if (email) {
    const [localPart, domain] = email?.split("@");
    const maskedLocal = localPart[0] + "*"?.repeat(localPart.length - 1);
    return maskedLocal + "@" + domain;
  }
}
