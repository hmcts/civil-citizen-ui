import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {translateClaimantResponseDJToCCD} from 'services/translation/claimantResponse/ccdTranslation';
import {YesNo} from 'form/models/yesNo';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {
  translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD,
} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    setRespondentDateOfBirth(claim);
    const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
    if (claim.isClaimantIntentionPending()) {
      const ccdResponseForRequestDefaultJudgement = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, claimFee);
      return await civilServiceClient.submitClaimantResponseForRequestJudgementAdmission(req.params.id, ccdResponseForRequestDefaultJudgement, req);
    }
    const ccdResponse = translateClaimantResponseDJToCCD(claim);
    logger.info('Translation claimant response sent to civil-service - submit event');
    return await civilServiceClient.submitClaimantResponseDJEvent(claimId, ccdResponse, req);
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
