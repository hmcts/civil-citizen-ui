process.env.NODE_ENV = 'test';
import '../setup/testSetup';
import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {buildYourResponsePaymentSection} from '../../main/services/features/response/checkAnswers/responseSection/buildYourResponsePaymentSection';
import {submitResponse} from '../../main/services/features/response/submission/submitResponse';
import {submitClaimantResponse} from '../../main/services/features/claimantResponse/submitClaimantResponse';
import {civilServiceClientMock} from '../setup/sharedMocks';
import {ChooseHowProceed} from '../../main/common/models/chooseHowProceed';
import {YesNo} from '../../main/common/form/models/yesNo';
import * as draftStoreService from '../../main/modules/draft-store/draftStoreService';
import * as claimantCcjTranslationService from '../../main/services/translation/claimantResponse/ccdRequestJudgementTranslation';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

const buildFullAdmitClaim = (paymentOption: PaymentOptionType): Claim => {
  const claim = new Claim();
  claim.id = '12345';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    responseType: ResponseType.FULL_ADMISSION,
    partyDetails: {
      primaryAddress: {
        postCode: 'SW1A 1AA',
        city: 'London',
        addressLine1: 'Line 1',
      },
    },
  } as never;
  claim.fullAdmission = {
    paymentIntention: {
      paymentOption,
      paymentDate: new Date('2026-05-20'),
      repaymentPlan: {
        paymentAmount: 250,
        repaymentFrequency: 'WEEK',
        firstRepaymentDate: new Date('2026-05-22'),
      },
    },
  };
  return claim;
};

describe('Integration: full-admit migration coverage', () => {
  const summaryValues = (claim: Claim): string[] => {
    const section = buildYourResponsePaymentSection(claim, '12345', 'en');
    return section.summaryList.rows
      .filter(Boolean)
      .map(row => String((row as {value?: {text?: string; html?: string}}).value?.text ?? (row as {value?: {text?: string; html?: string}}).value?.html ?? ''));
  };

  describe('CYA branching content', () => {
    it('renders immediate payment summary row', () => {
      const values = summaryValues(buildFullAdmitClaim(PaymentOptionType.IMMEDIATELY));

      expect(values).toContain('COMMON.PAYMENT_OPTION.IMMEDIATELY');
    });

    it('renders pay-by-date summary row with date', () => {
      const values = summaryValues(buildFullAdmitClaim(PaymentOptionType.BY_SET_DATE));

      expect(values.some(value => value.includes('COMMON.PAYMENT_OPTION.BY_SET_DATE'))).toBe(true);
    });

    it('renders instalment summary rows', () => {
      const values = summaryValues(buildFullAdmitClaim(PaymentOptionType.INSTALMENTS));

      expect(values).toContain('COMMON.PAYMENT_OPTION.INSTALMENTS');
      expect(values).toContain('£250');
      expect(values).toContain('COMMON.PAYMENT_FREQUENCY.WEEK');
    });
  });

  describe('Submission payload shape', () => {
    it('submits defendant full-admit immediate-payment payload to civil service', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.IMMEDIATELY);
      const req = {params: {id: '12345'}} as never;

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue({
        respondent1: {
          partyDetails: {
            primaryAddress: {
              postCode: 'SW1A 1AA',
              city: 'London',
              addressLine1: 'Line 1',
            },
          },
        },
      });
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        respondent1ClaimResponseTypeForSpec: ResponseType.FULL_ADMISSION,
        defenceAdmitPartPaymentTimeRouteRequired: PaymentOptionType.IMMEDIATELY,
        respondToClaimAdmitPartLRspec: expect.anything(),
      }));
    });

    it('submits defendant full-admit by-set-date payload to civil service', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.BY_SET_DATE);
      const req = {params: {id: '12345'}} as never;

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue({
        respondent1: {
          partyDetails: {
            primaryAddress: {
              postCode: 'SW1A 1AA',
              city: 'London',
              addressLine1: 'Line 1',
            },
          },
        },
      });
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        respondent1ClaimResponseTypeForSpec: ResponseType.FULL_ADMISSION,
        defenceAdmitPartPaymentTimeRouteRequired: expect.anything(),
        respondToClaimAdmitPartLRspec: expect.anything(),
      }));
    });

    it('submits defendant full-admit instalments payload to civil service', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.INSTALMENTS);
      const req = {params: {id: '12345'}} as never;

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue({
        respondent1: {
          partyDetails: {
            primaryAddress: {
              postCode: 'SW1A 1AA',
              city: 'London',
              addressLine1: 'Line 1',
            },
          },
        },
      });
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        respondent1ClaimResponseTypeForSpec: ResponseType.FULL_ADMISSION,
        defenceAdmitPartPaymentTimeRouteRequired: 'SUGGESTION_OF_REPAYMENT_PLAN',
        respondent1RepaymentPlan: expect.anything(),
      }));
    });

    it('submits claimant full-admit CCJ payload with CCJ mapping merged', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.BY_SET_DATE);
      claim.claimantResponse = {
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      } as never;
      const req = {params: {id: '12345'}} as never;

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD')
        .mockResolvedValue({ccjMergedField: 'yes'} as never);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({ccjMergedField: 'yes'}));
      expect(payload).toHaveProperty('applicant1AcceptFullAdmitPaymentPlanSpec');
    });

    it('submits claimant full-admit settlement-agreement path without CCJ mapping', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.INSTALMENTS);
      claim.claimantResponse = {
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        suggestedPaymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: {
            paymentAmount: 120,
            repaymentFrequency: 'WEEK',
            firstRepaymentDate: new Date('2026-05-22'),
          },
        },
      } as never;
      const req = {params: {id: '12345'}} as never;

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toHaveProperty('applicant1RepaymentOptionForDefendantSpec');
      expect(payload).toHaveProperty('applicant1SuggestInstalmentsPaymentAmountForDefendantSpec');
      expect(claimantCcjTranslationService.translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD).not.toHaveBeenCalled();
    });

    it('submits claimant full-admit settlement-agreement after pay-by-set-date defendant offer', async () => {
      const claim = buildFullAdmitClaim(PaymentOptionType.BY_SET_DATE);
      claim.claimantResponse = {
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
      } as never;
      const req = {params: {id: '12345'}} as never;
      const ccjSpy = jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD');

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptFullAdmitPaymentPlanSpec: 'Yes',
      }));
      expect(ccjSpy).not.toHaveBeenCalled();
    });
  });
});
