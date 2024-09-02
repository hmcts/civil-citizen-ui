import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {translateDraftApplicationToCCD} from 'services/translation/generalApplication/ccdTranslation';
import {getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitApplication = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const ccdApplication = translateDraftApplicationToCCD(claim.generalApplication);
    return await civilServiceClient.submitInitiateGeneralApplicationEvent(claimId, ccdApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
