import {AppRequest} from 'common/models/AppRequest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'common/models/claim';
import {translateDraftClaimToCCD} from 'services/translation/claim/ccdTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaim = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getCaseDataFromStore(req.session?.user?.id);
    const ccdClaim = translateDraftClaimToCCD(claim, req);
    return await civilServiceClient.submitDraftClaim(ccdClaim, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
