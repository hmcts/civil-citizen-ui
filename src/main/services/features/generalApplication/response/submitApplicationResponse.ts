import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {Application} from 'models/application';
import {getClaimById} from 'modules/utilityService';
import {GaServiceClient} from 'client/gaServiceClient';
import {queryParamNumber} from 'common/utils/requestUtils';
import { toCcdGeneralApplicationWithResponse } from 'services/translation/generalApplication/ccdTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitApplicationResponse');

const gaServiceApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(gaServiceApiBaseUrl);

export const submitApplicationResponse = async (req: AppRequest): Promise<Application> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationId = queryParamNumber(req, 'applicationId');
    const applicationResponse = await gaServiceClient.getApplication(req, `${applicationId}`);
    const generalApplication = toCcdGeneralApplicationWithResponse(applicationResponse?.case_data, claim.generalApplication);
    return await gaServiceClient.submitRespondToApplicationEvent(applicationResponse.id, generalApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
