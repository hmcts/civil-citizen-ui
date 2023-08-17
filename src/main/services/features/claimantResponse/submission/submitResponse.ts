import {AppRequest} from 'models/AppRequest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {translateClaimantResponseDJToCCD} from 'services/translation/claimantResponse/ccdTranslation';
import {YesNo} from 'form/models/yesNo';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    await setRespondentDateOfBirth(claim);
    const ccdResponse = translateClaimantResponseDJToCCD(claim);
    logger.info(ccdResponse);
    return await civilServiceClient.submitClaimantResponseDJEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

const setRespondentDateOfBirth = (claim: Claim) => {
  if(!claim.isBusiness()){
    if(!claim.respondent1?.dateOfBirth && claim.claimantResponse?.ccjRequest?.defendantDOB?.option === YesNo.YES){
      claim.respondent1.dateOfBirth = new CitizenDate();
      claim.respondent1.dateOfBirth.date = claim.claimantResponse.ccjRequest.defendantDOB.dob.dateOfBirth;
    }
  }
};
