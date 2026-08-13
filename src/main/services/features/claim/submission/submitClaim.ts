import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
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
    const draftId = req.session?.draftId;
    const user = req.session?.user;
    const claim = await getDraftClaim(req);
    logger.info('Claim fee retrieved from check-your-answers');
    if (claim.applicant1) {
      claim.applicant1.emailAddress = new Email(user?.email);
      await updateDraftClaim(req, claim, draftId);
    }
    const ccdClaim = translateDraftClaimToCCDR2(claim, req);
    return await civilServiceClient.submitDraftClaim(ccdClaim, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
