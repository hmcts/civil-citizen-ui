import {AppRequest} from 'models/AppRequest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {translateClaimantResponseDJToCCD} from 'services/translation/claimantResponse/ccdTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    if(!claim.respondent1?.dateOfBirth){
      //TODO: Redirection from ccj/paid-amount-summary to ccj/payment-options
      //TODO: Check when dateOfBirth.date is undefined
      claim.respondent1.dateOfBirth.date = claim.claimantResponse.ccjRequest.defendantDOB.dob.dateOfBirth;
    }
    const ccdResponse = translateClaimantResponseDJToCCD(claim);
    logger.info(ccdResponse);
    return await civilServiceClient.submitClaimantResponseDJEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
