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
} from 'routes/urls';
import {toCCDClaimantProposedPlan} from 'models/claimantResponse/ClaimantProposedPlan';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function getRedirectionUrl(claim: Claim, courtDecision: RepaymentDecisionType) {
  if (courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT) {
    if (claim.getPaymentIntention().paymentOption == PaymentOptionType.INSTALMENTS) {
      return CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL;
    } else if (claim.getPaymentIntention().paymentOption == PaymentOptionType.BY_SET_DATE) {
      return CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL;
    }
  } else if (courtDecision === RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT) {
    return CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL;
  }
  return undefined;
}

export const getCourtDecision = async (req: AppRequest, claimId: any) => {
  const claim:Claim = await getClaimById(claimId, req);
  const claimantProposedPlan = toCCDClaimantProposedPlan(claim.claimantResponse.suggestedPaymentIntention);
  const courtDecision = await civilServiceClient.getCourtDecision(claimId, <AppRequest>req, claimantProposedPlan);
  return getRedirectionUrl(claim, courtDecision);
};

