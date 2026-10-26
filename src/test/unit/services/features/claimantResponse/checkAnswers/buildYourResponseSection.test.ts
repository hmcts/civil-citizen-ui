import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {PartialAdmission} from 'common/models/partialAdmission';
import {Party} from 'common/models/party';
import {RejectionReason} from 'common/form/models/claimantResponse/rejectionReason';
import {t} from 'i18next';
import {buildYourResponseSection} from 'services/features/claimantResponse/responseSection/buildYourResponseSection';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import { TransactionSchedule } from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import { RejectAllOfClaim } from 'common/form/models/rejectAllOfClaim';
import { HowMuchHaveYouPaid } from 'common/form/models/admission/howMuchHaveYouPaid';
import {
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PaymentDate} from 'common/form/models/admission/fullAdmission/paymentOption/paymentDate';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Your response Section', () => {

  const claimId = '123';
  const lng = 'en';
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo();
  claim.claimantResponse.fullAdmitSetDateAcceptPayment.option = YesNo.NO;
  it('should return Your response sections when FA', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    claim.claimantResponse = new ClaimantResponse();
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(0);
  });

  it('should return Your response sections when PA and paid', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.YES);
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(2);
  });

  it('should return 3 sections wen payment accepted', async () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse = new ClaimantResponse();
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 5;
    claim.totalClaimAmount = 10;

    claim.claimantResponse.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
    claim.claimantResponse.rejectionReason = new RejectionReason('test');
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(3);
  });

  it('should return Your response sections when rejection set by date', async () => {
    //Given
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    claim.claimantResponse.suggestedPaymentIntention.paymentDate = new Date('2022-06-01T00:00:00Z');
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(2);
  });

  it('should return Your response sections when rejection installments', async () => {
    //Given

    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = {
      paymentAmount: 1,
      repaymentFrequency: '',
      firstRepaymentDate: new Date(),
    };

    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(5);
  });
  it('should return Your response sections when claimant suggested payment plan option by installments', async () => {
    //Given
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    claim.claimantResponse.suggestedPaymentIntention.repaymentPlan = { paymentAmount: 100, repaymentFrequency: TransactionSchedule.WEEK, firstRepaymentDate: new Date() };
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(4);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('COMMON.PAYMENT_OPTION.INSTALMENTS', { lng }));
  });
});

describe('Your response Section change links', () => {
  it.each([
    PaymentOptionType.IMMEDIATELY,
    PaymentOptionType.INSTALMENTS,
    PaymentOptionType.BY_SET_DATE,
  ])('links the claimant payment choice %s to payment-option and preserves the admission decision link', paymentOption => {
    const claim = new Claim();
    claim.respondent1 = {responseType: ResponseType.PART_ADMISSION};
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.hasPartAdmittedBeenAccepted = new GenericYesNo(YesNo.YES);
    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption,
      paymentDate: new PaymentDate('2032', '6', '14') as unknown as Date,
      repaymentPlan: {paymentAmount: 100, repaymentFrequency: TransactionSchedule.MONTH, firstRepaymentDate: new Date('2032-06-14')},
    };

    const rows = buildYourResponseSection(claim, '123', 'en').summaryList.rows;
    const paymentChoice = rows.find(row => row.key.text === 'PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_DEFENDANT_TO_PAY');
    const admissionDecision = rows.find(row => row.key.text === 'PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION');

    expect(paymentChoice.actions.items[0].href).toBe(constructResponseUrlWithIdParams('123', CLAIMANT_RESPONSE_PAYMENT_OPTION_URL));
    expect(admissionDecision.actions.items[0].href).toBe(constructResponseUrlWithIdParams('123', CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL));
    if (paymentOption === PaymentOptionType.INSTALMENTS) {
      const details = rows.filter(row => [
        'PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS',
        'PAGES.CHECK_YOUR_ANSWER.FREQUENCY_OF_PAYMENTS',
        'PAGES.CHECK_YOUR_ANSWER.DATE_FOR_FIRST_INSTALMENT',
      ].includes(row.key.text));
      expect(details).toHaveLength(3);
      expect(details.map(row => row.actions.items[0].href)).toEqual(Array(3).fill(constructResponseUrlWithIdParams('123', CLAIMANT_RESPONSE_PAYMENT_PLAN_URL)));
    }
  });
});

describe('Your response Section for settle the claim', () => {
  const claimId = '123';
  const lng = 'en';
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.respondent1 = new Party();
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
    claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 10;
    claim.totalClaimAmount = 10;
  });

  it('should return Settle The Claim Section when it is Full Defence and Paid with Yes', async () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled = new GenericYesNo(YesNo.YES);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('COMMON.YES', { lng }));
    expect(yourResponseSection.summaryList.rows[0].key.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', { lng }));
  });

  it('should return Settle The Claim Section when it is Full Defence and Paid with No', async () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.claimantResponse.hasFullDefenceStatesPaidClaimSettled = new GenericYesNo(YesNo.NO);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('COMMON.NO', { lng }));
    expect(yourResponseSection.summaryList.rows[0].key.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', { lng }));
  });

  it('should return Settle The Claim Section when it is Part Admit and Paid with Yes', async () => {
    //Given
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.YES);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('COMMON.YES', { lng }));
    expect(yourResponseSection.summaryList.rows[0].key.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', { lng }));
  });

  it('should return Settle The Claim Section when it is Part Admit and Paid with No', async () => {
    //Given
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.claimantResponse.hasPartPaymentBeenAccepted = new GenericYesNo(YesNo.NO);
    //When
    const yourResponseSection = buildYourResponseSection(claim, claimId, lng);
    //Then
    expect(yourResponseSection.title).toBe(t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', lng));
    expect(yourResponseSection.summaryList.rows.length).toBe(1);
    expect(yourResponseSection.summaryList.rows[0].value.html).toContain(t('COMMON.NO', { lng }));
    expect(yourResponseSection.summaryList.rows[0].key.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', { lng }));
  });
});
