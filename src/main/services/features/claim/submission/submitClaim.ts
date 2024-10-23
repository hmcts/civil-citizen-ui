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
    logger.info('claim fee from cya ' + claim.claimFee?.calculatedAmountInPence);
    if (claim.applicant1) {
      claim.applicant1.emailAddress = new Email(user.email);
      await saveDraftClaim(claimId, claim);
    }
    const ccdClaim = translateDraftClaimToCCDR2(claim, req);
    return await civilServiceClient.submitDraftClaim(ccdClaim, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

