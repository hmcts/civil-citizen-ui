import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {translateDraftResponseToCCD} from '../../../translation/response/ccdTranslation';
import {addressHasChange} from './compareAddress';
import {
  getClaimWithExtendedPaymentDeadline,
} from 'services/features/response/submitConfirmation/submitConfirmationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitResponse');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const claimFromCivilService = await civilServiceClient.retrieveClaimDetails(claimId, req);
    claim.respondentPaymentDeadline = await getClaimWithExtendedPaymentDeadline(claim, req);
    const isAddressUpdated = addressHasChange(claim.respondent1?.partyDetails?.primaryAddress, claimFromCivilService?.respondent1?.partyDetails?.primaryAddress);
    const ccdResponse = translateDraftResponseToCCD(claim, isAddressUpdated);
    logger.info('Successfully translated the defendant response to ccd');
    return await civilServiceClient.submitDefendantResponseEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
