import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {toCcdGeneralApplicationRespondentResponse} from 'services/translation/generalApplication/ccdTranslation';
import {Application} from 'models/application';
import {getClaimById} from 'modules/utilityService';
import {GaServiceClient} from 'client/gaServiceClient';
import { CCDGeneralApplication } from 'common/models/gaEvents/eventDto';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitApplicationResponse');

const gaServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(gaServiceApiBaseUrl);

export const submitApplicationResponse = async (req: AppRequest): Promise<Application> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const userId = req.session?.user?.id;
    const applicationId = claim.generalApplication?.caseLink?.caseReference;
    const applicationResponse = await gaServiceClient.getApplication(applicationId, req);
    const generalApplication: CCDGeneralApplication = {
      ...applicationResponse?.case_data,
      respondentsResponses: [toCcdGeneralApplicationRespondentResponse(claim.generalApplication, userId)],
    };
    return await gaServiceClient.submitRespondToApplicationEvent(applicationResponse.id, generalApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
