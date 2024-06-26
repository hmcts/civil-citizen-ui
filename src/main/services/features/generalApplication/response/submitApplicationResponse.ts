import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {toCcdGeneralApplicationRespondentResponse} from 'services/translation/generalApplication/ccdTranslation';
import {Application} from 'models/application';
import {getClaimById} from 'modules/utilityService';
import {GaServiceClient} from 'client/gaServiceClient';
import { CCDGeneralApplication } from 'common/models/gaEvents/eventDto';
//import { CCDGeneralApplication } from 'common/models/gaEvents/eventDto';
//import { getLast } from '../generalApplicationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitApplicationResponse');

const gaServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(gaServiceApiBaseUrl);

export const submitApplicationResponse = async (req: AppRequest): Promise<Application> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    //const applicationId = claim.generalApplication?.caseLink?.caseReference;
    //const applicationId = '1718976755835339';
    //const applicationId = '1718969207972180';
    //const applications = await generalApplicationClient.getApplications(req);
    const applicationResponse = await gaServiceClient.getLatestCcdApplication(req);//.getApplication(req, applicationId);
    
    //const ccdApplication = translateDraftApplicationToCCD(claim.generalApplication);
    const generalApplication = {
      ...applicationResponse?.case_data,
      respondentsResponses: [toCcdGeneralApplicationRespondentResponse(claim.generalApplication)],
    };
    return await gaServiceClient.submitRespondToApplicationEvent(applicationResponse.id, generalApplication as CCDGeneralApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
