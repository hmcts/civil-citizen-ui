import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {FullAdmission} from 'models/fullAdmission';
import {PartialAdmission} from 'models/partialAdmission';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {ResponseType} from 'form/models/responseType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

/** Distinct claimant and defendant terms make accidental plan substitution visible. */
export const settlementAgreementClaim = (
  courtAccepted: boolean,
  paymentOption: PaymentOptionType,
  responseType = ResponseType.FULL_ADMISSION,
): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 200;
  claim.applicant1 = new Party();
  claim.applicant1.type = PartyType.INDIVIDUAL;
  claim.applicant1.partyDetails = new PartyDetails({firstName: 'James', lastName: 'White'});
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.partyDetails = new PartyDetails({firstName: 'John', lastName: 'White'});
  claim.respondent1.responseType = responseType;

  const defendantPlan = new PaymentIntention();
  defendantPlan.paymentOption = paymentOption === PaymentOptionType.IMMEDIATELY ? PaymentOptionType.BY_SET_DATE : paymentOption;
  defendantPlan.paymentDate = new Date('2035-08-01T12:00:00Z');
  defendantPlan.repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: TransactionSchedule.MONTH,
    firstRepaymentDate: new Date('2035-02-01T12:00:00Z'),
  };
  if (responseType === ResponseType.PART_ADMISSION) {
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 200);
    claim.partialAdmission.paymentIntention = defendantPlan;
  } else {
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = defendantPlan;
  }

  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.courtDecision = courtAccepted
    ? RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT : RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT;
  claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2035-05-01T12:00:00Z');
  claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = paymentOption;
  claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date('2035-06-01T12:00:00Z');
  claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
    paymentAmount: 50,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date('2035-01-01T12:00:00Z'),
  };
  return claim;
};
