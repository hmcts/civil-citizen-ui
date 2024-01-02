import { CaseState } from 'common/form/models/claimDetails';
import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { ClaimantResponse } from 'common/models/claimantResponse';
import {
  translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD,
  translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD,
} from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
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
import { RepaymentDecisionType } from 'models/claimantResponse/RepaymentDecisionType';
import { PaymentDate } from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import { CcjPaymentOption } from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import { InstalmentFirstPaymentDate } from 'models/claimantResponse/ccj/instalmentFirstPaymentDate';
import { TransactionSchedule } from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('Translate claimant ccj request to ccd', () => {
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
    claim.claimantResponse.courtDecision =
      RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.fullAdmission = new FullAdmission();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption =
      PaymentOptionType.INSTALMENTS;
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 50,
      repaymentFrequency: 'MONTH',
      firstRepaymentDate: paymentDate,
    };
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
        CCDClaimantPaymentOption.REPAYMENT_PLAN,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec:
        'ONCE_ONE_MONTH',
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 50,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec:
        paymentDate,
      applicant1RequestedPaymentDateForDefendantSpec: {},
    });
  });
});

describe('Translate claimant default ccj request to ccd', () => {
  let claim: Claim;
  const paymentDate = new PaymentDate('2024', '1', '1');
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
    claim.claimantResponse.ccjRequest = {
      defendantPaymentDate: paymentDate,
      ccjPaymentOption: new CcjPaymentOption(PaymentOptionType.BY_SET_DATE),
      paidAmount: {
        option: YesNo.YES,
        amount: 50,
      },
    };
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': '5000',
      'ccjPaymentPaidSomeOption': 'Yes',
      applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
      CCDClaimantPaymentOption.SET_DATE,
      applicant1RequestedPaymentDateForDefendantSpec: {
        paymentSetDate: paymentDate.date,
      },
    });
  });
  it('should translate ccj request for judgment admission into the CCD response without paid amount', () => {
    const firstPaymentDate: Record<string, string> = {};
    firstPaymentDate['year'] = '2024';
    firstPaymentDate['month'] = '1';
    firstPaymentDate['day'] = '1';
    claim.claimantResponse.ccjRequest = {
      ccjPaymentOption: new CcjPaymentOption(PaymentOptionType.INSTALMENTS),
      repaymentPlanInstalments: {
        firstPaymentDate: new InstalmentFirstPaymentDate(firstPaymentDate),
        paymentFrequency: TransactionSchedule.WEEK,
        amount: 50,
      },
      paidAmount: {
        option: YesNo.NO,
        amount: 0,
      },
    };
    const ccdResponse = translateClaimantResponseRequestDefaultJudgementByAdmissionToCCD(claim, 300);
    expect(ccdResponse).toEqual({
      'ccjJudgmentAmountClaimFee': '300',
      'ccjJudgmentLipInterest': '0',
      'ccjPaymentPaidSomeAmount': null,
      'ccjPaymentPaidSomeOption': 'No',applicant1: toCCDParty(claim.applicant1),
      respondent1: toCCDParty(claim.respondent1),
      totalClaimAmount: 1000,
      applicant1RepaymentOptionForDefendantSpec:
      CCDClaimantPaymentOption.REPAYMENT_PLAN,
      applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: 'ONCE_ONE_WEEK',
      applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 50,
      applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: new Date(2024, 0, 1),
      applicant1RequestedPaymentDateForDefendantSpec: {},
    });
  });
});
