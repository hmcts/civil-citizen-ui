import { CaseState } from 'common/form/models/claimDetails';
import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD } from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
import { Party } from 'models/party';
import { PartyDetails } from 'form/models/partyDetails';
import { buildAddress } from '../../../../utils/mockClaim';
import { PartyType } from 'models/partyType';
import { toCCDParty } from 'services/translation/response/convertToCCDParty';
import { ChooseHowProceed } from 'models/chooseHowProceed';
import { ChooseHowToProceed } from 'form/models/claimantResponse/chooseHowToProceed';
import { GenericYesNo } from 'form/models/genericYesNo';
import { FullAdmission } from 'models/fullAdmission';
import { PaymentIntention } from 'form/models/admission/paymentIntention';
import { PaymentOptionType } from 'form/models/admission/paymentOption/paymentOptionType';
import { CCDClaimantPaymentOption } from 'models/ccdResponse/ccdClaimantPaymentOption';
import {
  CourtProposedPlan,
  CourtProposedPlanOptions,
} from 'form/models/claimantResponse/courtProposedPlan';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';

describe('Translate claimant ccd request  to ccd version', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.applicant1 = new Party();
    claim.applicant1.partyDetails = new PartyDetails({});
    claim.applicant1.type = PartyType.INDIVIDUAL;
    claim.applicant1.partyDetails.primaryAddress = buildAddress();
    claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
    claim.respondent1 = claim.applicant1;
    claim.totalClaimAmount = 1000;
  });

  it('should translate ccj request for judgment admission into the CCD response', () => {
    const paymentDate = new Date();
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(
      ChooseHowProceed.REQUEST_A_CCJ,
    );
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(
      YesNo.YES,
    );
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption =
      PaymentOptionType.BY_SET_DATE;
    claim.fullAdmission.paymentIntention.paymentDate = paymentDate;
    claim.claimantResponse.ccjRequest = {
      paidAmount: {
        option: YesNo.YES,
        amount: 50,
      },
    };
    const ccdResponse =
      translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(
        claim,
        300,
      );
    expect(ccdResponse).toEqual({
      ccjJudgmentAmountClaimFee: '300',
      ccjJudgmentLipInterest: '0',
      ccjPaymentPaidSomeAmount: '5000',
      ccjPaymentPaidSomeOption: 'Yes',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
        CCDClaimantPaymentOption.SET_DATE,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: undefined,
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: undefined,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: undefined,
      applicant1RequestedPaymentDateForDefendantSpec: {
        paymentSetDate: paymentDate,
      },
    });
  });
  it('should translate ccj request for judgment admission into the CCD response without paid amount', () => {
    const paymentDate = new Date();
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(
      ChooseHowProceed.REQUEST_A_CCJ,
    );
    claim.claimantResponse.courtProposedPlan = new CourtProposedPlan(
      CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN,
    );
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.fullAdmission = new FullAdmission();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption =
      PaymentOptionType.BY_SET_DATE;
    claim.claimantResponse.suggestedPaymentIntention.paymentDate = paymentDate;
    claim.claimantResponse.ccjRequest = {
      paidAmount: {
        option: YesNo.NO,
        amount: 0,
      },
    };
    const ccdResponse =
      translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD(
        claim,
        300,
      );
    expect(ccdResponse).toEqual({
      ccjJudgmentAmountClaimFee: '300',
      ccjJudgmentLipInterest: '0',
      ccjPaymentPaidSomeAmount: null,
      ccjPaymentPaidSomeOption: 'No',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
        CCDClaimantPaymentOption.SET_DATE,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: undefined,
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: undefined,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: undefined,
      applicant1RequestedPaymentDateForDefendantSpec: {
        paymentSetDate: paymentDate,
      },
    });
  });
});
