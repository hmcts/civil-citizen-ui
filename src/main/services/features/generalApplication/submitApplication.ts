import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {GaServiceClient} from 'client/gaServiceClient';
import {translateDraftApplicationToCCD} from 'services/translation/generalApplication/ccdTranslation';
import {Application} from 'models/application';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const gaServiceApiBaseUrl = config.get<string>('services.civilGeneralApplications.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(gaServiceApiBaseUrl);

export const submitApplication = async (req: AppRequest): Promise<Application> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const ccdApplication = translateDraftApplicationToCCD(claim.generalApplication);
    return await gaServiceClient.submitDraftApplication(ccdApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
