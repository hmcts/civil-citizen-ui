import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {SignSettlmentAgreement} from 'form/models/claimantResponse/signSettlementAgreement';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {getRespondToSettlementAgreementDeadline} from 'services/features/claimantResponse/signSettlmentAgreementService';

jest.mock('client/civilServiceClient');

describe('settlement agreement deadline', () => {
  let claim: Claim;
  let req: AppRequest;
  const deadline = new Date(2035, 6, 10);
  const calculate = jest.mocked(CivilServiceClient.prototype.calculateExtendedResponseDeadline);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2035, 5, 30, 17, 0, 0));
    calculate.mockResolvedValue(deadline);
    req = {params: {id: 'claim-123'}, session: {user: {id: 'user-456'}}} as unknown as AppRequest;
    claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);
    claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement('true');
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  });

  afterEach(() => jest.useRealTimers());

  it.each([undefined, ChooseHowProceed.REQUEST_A_CCJ])('does not request a deadline when the choice is %s', async option => {
    claim.claimantResponse.chooseHowToProceed = new ChooseHowToProceed(option);

    await expect(getRespondToSettlementAgreementDeadline(req, claim)).resolves.toBeUndefined();
    expect(calculate).not.toHaveBeenCalled();
  });

  it.each([
    [RepaymentDecisionType.IN_FAVOUR_OF_DEFENDANT, PaymentOptionType.IMMEDIATELY],
    [RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT, PaymentOptionType.BY_SET_DATE],
    [RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT, PaymentOptionType.INSTALMENTS],
  ])('requests seven days without the immediate cutoff for %s / %s', async (decision, paymentOption) => {
    claim.claimantResponse.courtDecision = decision as RepaymentDecisionType;
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = paymentOption as PaymentOptionType;

    await expect(getRespondToSettlementAgreementDeadline(req, claim)).resolves.toBe(deadline);
    expect(calculate).toHaveBeenCalledTimes(1);
    expect(calculate).toHaveBeenCalledWith(new Date(2035, 5, 30, 17, 0, 0), 7, req);
    expect(calculate.mock.calls[0][2]).toBe(req);
  });

  it.each([
    [new Date(2035, 5, 30, 15, 59, 59), new Date(2035, 5, 30, 15, 59, 59)],
    [new Date(2035, 5, 30, 16, 0, 0), new Date(2035, 6, 1, 16, 0, 0)],
    [new Date(2035, 5, 30, 17, 0, 0), new Date(2035, 6, 1, 17, 0, 0)],
  ])('requests five days from the correct starting date at %s', async (now, start) => {
    jest.setSystemTime(now);
    claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;

    await expect(getRespondToSettlementAgreementDeadline(req, claim)).resolves.toBe(deadline);
    expect(calculate).toHaveBeenCalledTimes(1);
    expect(calculate).toHaveBeenCalledWith(start, 5, req);
    expect(calculate.mock.calls[0][2]).toBe(req);
  });
});
