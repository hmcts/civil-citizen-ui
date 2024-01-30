import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {toCCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';
import { saveClaimantResponse } from './claimantResponseService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function getRedirectionUrl(claim: Claim, courtDecision: RepaymentDecisionType) {
  if (courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT) {
    if (claim.getPaymentIntention().paymentOption === PaymentOptionType.INSTALMENTS) {
      return CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL;
    } else if (claim.getPaymentIntention().paymentOption === PaymentOptionType.BY_SET_DATE) {
      return CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL;
    }
  } else if (courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT) {
    return CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL;
  }
}

export const getDecisionOnClaimantProposedPlan = async (req: AppRequest, claimId: any) => {
  const claim : Claim = await getClaimById(claimId, req, true);
  if (claim.respondent1.type === 'ORGANISATION' || claim.respondent1.type === 'COMPANY') {
    return CLAIMANT_RESPONSE_TASK_LIST_URL;
  }
  const claimantProposedPlan = toCCDClaimantProposedPlan(claim.claimantResponse.suggestedPaymentIntention);
  const courtDecision = await civilServiceClient.getCalculatedDecisionOnClaimantProposedRepaymentPlan(claimId, req, claimantProposedPlan);
  await saveClaimantResponse(generateRedisKey(req), courtDecision, 'courtDecision');
  return getRedirectionUrl(claim, courtDecision);
};

