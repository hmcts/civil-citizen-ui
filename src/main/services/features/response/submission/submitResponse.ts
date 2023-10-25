import {AppRequest} from '../../../../common/models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import {translateDraftResponseToCCD} from '../../../translation/response/ccdTranslation';
import {addressHasChange} from './compareAddress';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitResponse');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const claimFromCivilService = await civilServiceClient.retrieveClaimDetails(claimId, req);
    const isAddressUpdated = addressHasChange(claim.respondent1?.partyDetails?.primaryAddress, claimFromCivilService?.respondent1?.partyDetails?.primaryAddress);
    const ccdResponse = translateDraftResponseToCCD(claim, isAddressUpdated);
    logger.info(ccdResponse);
    return await civilServiceClient.submitDefendantResponseEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
