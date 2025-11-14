import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  translateClaimantResponseToCCD,
} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';
import {ClaimantResponse} from 'models/claimantResponse';
import {translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import {ResponseType} from 'form/models/responseType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('submitClaimantResponse');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitClaimantResponse = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const paymentIntention = claim.getPaymentIntention();
    const partAdminPayImmediate = claim.respondent1 !== undefined && claim.respondent1?.responseType === ResponseType.PART_ADMISSION && paymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY && claim.claimantResponse?.isClaimantAcceptedPaymentPlan;
    let respondToClaimAdmitPartLRspec = undefined;
    if (!partAdminPayImmediate) {
      respondToClaimAdmitPartLRspec = {
        whenWillThisAmountBePaid: await getClaimWithExtendedPaymentDeadline(claim, req),
      };
    }

    let ccdResponse = translateClaimantResponseToCCD(claim, respondToClaimAdmitPartLRspec);
    const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
    if (claimantResponse.isCCJRequested && hasRespondTypeWithCCJRequest(claim)) {
      const claimFee = claim?.claimFee ? claim?.claimFee?.calculatedAmountInPence : undefined;
      const ccdResponseForRequestDefaultJudgement = await translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(claim, claimFee);
      ccdResponse = {...ccdResponse, ...ccdResponseForRequestDefaultJudgement};
    }
    logger.info('Submitting claimant intention...');
    return await civilServiceClient.submitClaimantResponseEvent(req.params.id, ccdResponse, req);
  } catch (err) {
    logger.error(`Error when submitting claimant response -  ${err.message}`);
    throw err;
  }
};

function hasRespondTypeWithCCJRequest(claim: Claim): boolean {
  return ((claim.isFullAdmission() && (claim.isFAPaymentOptionInstallments() || claim.isFAPaymentOptionBySetDate())) ||
    (claim.isPartialAdmission() && (claim.isPAPaymentOptionInstallments() || claim.isPAPaymentOptionByDate())));
}

export const getClaimWithExtendedPaymentDeadline = async (claim:Claim, req: AppRequest): Promise<Date> => {
  try {
    if (claim.isPartialAdmission() && claim.isPAPaymentOptionPayImmediately()) {
      return await civilServiceClient.calculateExtendedResponseDeadline(new Date(Date.now()), 5, req);
    }
    logger.info(`returning undefined when getting claim with extended payment deadline - claim.id  ${claim.id}`);
    return undefined;
  } catch (error) {
    logger.error(`Error when getting claim with extended payment deadline - ${error}`);
    throw error;
  }
};
