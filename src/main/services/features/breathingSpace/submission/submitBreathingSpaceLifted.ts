import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {translateBreathingSpaceToCCD} from 'services/translation/breathingSpace/ccdTranslation';
import {getBreathingSpace} from 'services/features/breathingSpace/breathingSpaceService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitBreathingSpaceLifted = async (req: AppRequest) => {
  try {
    const breathingSpace = await getBreathingSpace(generateRedisKey(req as unknown as AppRequest));
    const breathingSpaceResponse = translateBreathingSpaceToCCD(breathingSpace);
    await civilServiceClient.submitBreathingSpaceLiftedEvent(req.params.id, breathingSpaceResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
