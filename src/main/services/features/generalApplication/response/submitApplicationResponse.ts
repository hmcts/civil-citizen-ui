import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {Application} from 'models/application';
import {GaServiceClient} from 'client/gaServiceClient';
import { toCcdGeneralApplicationWithResponse } from 'services/translation/generalApplication/ccdTranslation';
import { getDraftGARespondentResponse } from './generalApplicationResponseStoreService';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitApplicationResponse');

const gaServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(gaServiceApiBaseUrl);

export const submitApplicationResponse = async (req: AppRequest): Promise<Application> => {
  try {
    const applicationId = req.params.appId;
    const applicationResponse = await gaServiceClient.getApplication(req, `${applicationId}`);
    const gaRedisKey = generateRedisKeyForGA(req);
    const gaRespondentResponse = await getDraftGARespondentResponse(gaRedisKey);
    const generalApplication = toCcdGeneralApplicationWithResponse(applicationResponse?.case_data, gaRespondentResponse);
    return await gaServiceClient.submitRespondToApplicationEvent(applicationResponse.id, generalApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
