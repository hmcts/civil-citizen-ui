import {CivilServiceClient} from 'client/civilServiceClient';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {AppRequest} from 'models/AppRequest';
import {
  getPaymentText,
  getRespondToSettlementAgreementDeadline,
  getRespondentToImmediateSettlementAgreementDeadLine,
} from 'services/features/claimantResponse/signSettlmentAgreementService';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

jest.mock('client/civilServiceClient', () => {
  const methods = {
    calculateExtendedResponseDeadline: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  calculateExtendedResponseDeadline: jest.Mock;
};

const request = {query: {lang: 'en'}, cookies: {lang: 'cy'}} as unknown as AppRequest;

const namedClaim = (): Claim => {
  const claim = new Claim();
  jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Claimant');
  jest.spyOn(claim, 'getDefendantFullName').mockReturnValue('Defendant');
  claim.totalClaimAmount = 1000;
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
  return claim;
};

describe('signSettlmentAgreementService', () => {
  beforeEach(() => {
    civilServiceMethods.calculateExtendedResponseDeadline.mockResolvedValue(new Date('2024-06-08'));
  });

  it('describes a claimant pay-by-date plan', () => {
    const claim = namedClaim();
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption: PaymentOptionType.BY_SET_DATE,
      paymentDate: {date: new Date('2024-07-01')},
    } as unknown as ClaimantResponse['suggestedPaymentIntention'];

    const text = getPaymentText(claim, request) as {paymentText: string; claimant: string};

    expect(text.paymentText).toBe('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE');
    expect(text.claimant).toBe('Claimant');
  });

  it('describes a claimant instalment plan', () => {
    const claim = namedClaim();
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption: PaymentOptionType.INSTALMENTS,
      repaymentPlan: {
        paymentAmount: 50,
        firstRepaymentDate: new Date('2024-07-01'),
        repaymentFrequency: 'WEEK',
      },
    } as unknown as ClaimantResponse['suggestedPaymentIntention'];

    const text = getPaymentText(claim, request) as {paymentText: string};

    expect(text.paymentText).toBe('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT');
  });

  it('describes an immediate claimant plan and uses the cookie language', () => {
    const claim = namedClaim();
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption: PaymentOptionType.IMMEDIATELY,
    } as unknown as ClaimantResponse['suggestedPaymentIntention'];
    claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date('2024-07-02');

    const text = getPaymentText(claim, {query: {}, cookies: {lang: 'cy'}} as unknown as AppRequest) as {paymentText: string};

    expect(text.paymentText).toBe('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.IMMEDIATE_PLAN');
  });

  it('describes the defendant payment date when the court has not accepted the claimant plan', () => {
    const claim = namedClaim();
    claim.claimantResponse.courtDecision = undefined;
    jest.spyOn(claim, 'isPAPaymentOptionByDate').mockReturnValue(true);
    jest.spyOn(claim, 'getPaymentDate').mockReturnValue(new Date('2024-08-01'));

    const text = getPaymentText(claim, request) as {paymentText: string};

    expect(text.paymentText).toBe('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE');
  });

  it('returns the immediate deadline after 4pm and the seven day deadline otherwise', async () => {
    const claim = namedClaim();
    claim.claimantResponse.chooseHowToProceed = {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT} as ChooseHowToProceed;
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption: PaymentOptionType.IMMEDIATELY,
    } as unknown as ClaimantResponse['suggestedPaymentIntention'];
    const hours = jest.spyOn(Date.prototype, 'getHours');

    hours.mockReturnValue(16);
    await getRespondToSettlementAgreementDeadline(request, claim);
    expect(civilServiceMethods.calculateExtendedResponseDeadline).toHaveBeenCalledWith(expect.any(Date), 5, request);

    hours.mockReturnValue(10);
    await getRespondentToImmediateSettlementAgreementDeadLine(request, claim);
    expect(civilServiceMethods.calculateExtendedResponseDeadline).toHaveBeenLastCalledWith(expect.any(Date), 5, request);

    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    await getRespondToSettlementAgreementDeadline(request, claim);
    expect(civilServiceMethods.calculateExtendedResponseDeadline).toHaveBeenLastCalledWith(expect.any(Date), 7, request);

    claim.claimantResponse.chooseHowToProceed.option = ChooseHowProceed.REQUEST_A_CCJ;
    await expect(getRespondToSettlementAgreementDeadline(request, claim)).resolves.toBeUndefined();
    hours.mockRestore();
  });
});
