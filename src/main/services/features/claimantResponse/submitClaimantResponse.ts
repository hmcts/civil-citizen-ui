import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {translateClaimantResponseToCCD} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';
import {ClaimantResponse} from 'models/claimantResponse';
import {translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {calculateInterestToDate} from 'common/utils/interestUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitClaimantResponse');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    let ccdResponse = translateClaimantResponseToCCD(claim);
    const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
    if (claimantResponse.isCCJRequested && hasRespondTypeWithCCJRequest(claim)) {
      let interestToDate = 0;
      if (claim.hasInterest()) {
        interestToDate = await calculateInterestToDate(claim);
      }
      const claimFee = await civilServiceClient.getClaimAmountFee(claim?.totalClaimAmount + interestToDate, req);
      const ccdResponseForRequestDefaultJudgement = await translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(claim, claimFee);
      ccdResponse = {...ccdResponse, ...ccdResponseForRequestDefaultJudgement};
    }
    logger.info('Submitting claimant intention...');
    return await civilServiceClient.submitClaimantResponseEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

function hasRespondTypeWithCCJRequest(claim: Claim): boolean {
  return ((claim.isFullAdmission() && (claim.isFAPaymentOptionInstallments() || claim.isFAPaymentOptionBySetDate())) ||
    (claim.isPartialAdmission() && (claim.isPAPaymentOptionInstallments() || claim.isPAPaymentOptionByDate())));
}
