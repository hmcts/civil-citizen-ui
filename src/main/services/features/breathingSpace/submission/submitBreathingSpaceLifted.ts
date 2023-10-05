import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {translateBreathingSpaceToCCD} from 'services/translation/breathingSpace/ccdTranslation';
import {getBreathingSpace} from 'services/features/breathingSpace/breathingSpaceService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitBreathingSpaceLifted = async (req: AppRequest): Promise<any> => {
  try {
    const breathingSpace = await getBreathingSpace(req.params.id);
    const breathingSpaceResponse = translateBreathingSpaceToCCD(breathingSpace);
    return await civilServiceClient.submitBreathingSpaceLiftedEvent(req.params.id, breathingSpaceResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
