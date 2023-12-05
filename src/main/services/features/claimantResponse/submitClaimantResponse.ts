import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {translateClaimantResponseToCCD} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitClaimantResponse');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const ccdResponse = translateClaimantResponseToCCD(claim);
    logger.info('Sumbmitting claimant intention...',ccdResponse);
    return await civilServiceClient.submitClaimantResponseEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
