/**
 * DTSCCI-5179 / 5178 stack: integration coverage for LiP v LiP part-admit response matrix.
 *
 * Replaces removed functional test:
 * - LipvLip_partAdmit_PayImmediately_tests.js (claimant accept/settle + fast-track reject payloads)
 *
 * Related browser coverage:
 * - LRvLip_response_partAdmit_HaventPaid_immediatePay_tests.js (@smoketest, solicitor defendant path)
 * - Other @ui-part-admit nightly tests (by-set-date, instalments, already-paid, etc.)
 *
 * Intentional gap:
 * - LiP v LiP claimant accept/reject immediate part-admit UI wizard (submission payloads covered here)
 */
process.env.NODE_ENV = 'test';
import '../setup/testSetup';
import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {buildYourResponsePaymentSection} from '../../main/services/features/response/checkAnswers/responseSection/buildYourResponsePaymentSection';
import {buildYourResponseToClaimSection} from '../../main/services/features/response/checkAnswers/responseSection/buildYourResponseToClaimSection';
import {submitResponse} from '../../main/services/features/response/submission/submitResponse';
import {submitClaimantResponse} from '../../main/services/features/claimantResponse/submitClaimantResponse';
import {civilServiceClientMock} from '../setup/sharedMocks';
import * as draftStoreService from '../../main/modules/draft-store/draftStoreService';
import {YesNo} from '../../main/common/form/models/yesNo';
import {ChooseHowProceed} from '../../main/common/models/chooseHowProceed';
import {ClaimantResponse} from '../../main/common/models/claimantResponse';
import {DashboardClaimantItem, DashboardDefendantItem} from '../../main/common/models/dashboard/dashboardItem';
import * as claimantCcjTranslationService from '../../main/services/translation/claimantResponse/ccdRequestJudgementTranslation';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

const withCommonRespondent = (claim: Claim): Claim => {
  claim.id = '12345';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    responseType: ResponseType.PART_ADMISSION,
    partyDetails: {
      primaryAddress: {
        postCode: 'SW1A 1AA',
        city: 'London',
        addressLine1: 'Line 1',
      },
    },
  } as never;
  return claim;
};

const buildPartAdmitClaim = (paymentOption: PaymentOptionType): Claim => {
  const claim = withCommonRespondent(new Claim());
  claim.partialAdmission = {
    alreadyPaid: {option: YesNo.NO},
    howMuchDoYouOwe: {amount: 600},
    paymentIntention: {
      paymentOption,
      paymentDate: new Date('2026-06-20'),
      repaymentPlan: {
        paymentAmount: 150,
        repaymentFrequency: 'WEEK',
        firstRepaymentDate: new Date('2026-06-27'),
      },
    },
  } as never;
  return claim;
};

const buildPartAdmitAlreadyPaidClaim = (): Claim => {
  const claim = withCommonRespondent(new Claim());
  claim.partialAdmission = {
    alreadyPaid: {option: YesNo.YES},
    howMuchHaveYouPaid: {
      amount: 400,
      date: new Date('2026-05-20'),
      text: 'By bank transfer',
    },
    whyDoYouDisagree: {text: 'Amount includes disputed fees'},
  } as never;
  return claim;
};

const buildClaimantResponseClaimForTrack = (responseClaimTrack: string): Claim => {
  const claim = buildPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
  claim.responseClaimTrack = responseClaimTrack as never;
  claim.claimantResponse = {
    hasPartAdmittedBeenAccepted: {option: YesNo.YES},
    fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
    chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
    directionQuestionnaire: {
      hearing: {
        preferredCourt: 'London Civil',
      },
    },
  } as never;
  return claim;
};

describe('Integration: part-admit migration coverage', () => {
  const summaryValues = (claim: Claim): string[] => {
    const section = buildYourResponsePaymentSection(claim, '12345', 'en');
    return section.summaryList.rows
      .filter(Boolean)
      .map(row => String((row as {value?: {text?: string; html?: string}}).value?.text ?? (row as {value?: {text?: string; html?: string}}).value?.html ?? ''));
  };

  describe('Defendant branching and CYA rendering', () => {
    it('renders already-paid response row for part-admit', () => {
      const section = buildYourResponseToClaimSection(buildPartAdmitAlreadyPaidClaim(), '12345', 'en');
      const values = section.summaryList.rows.map(row => String(row.value?.text ?? row.value?.html ?? ''));

      expect(values).toContain('COMMON.VARIATION_2.YES');
    });

    it('renders immediate payment summary row', () => {
      const values = summaryValues(buildPartAdmitClaim(PaymentOptionType.IMMEDIATELY));

      expect(values).toContain('COMMON.PAYMENT_OPTION.IMMEDIATELY');
    });

    it('renders pay-by-date summary row with date', () => {
      const values = summaryValues(buildPartAdmitClaim(PaymentOptionType.BY_SET_DATE));

      expect(values.some(value => value.includes('COMMON.PAYMENT_OPTION.BY_SET_DATE'))).toBe(true);
    });

    it('renders instalments summary rows', () => {
      const values = summaryValues(buildPartAdmitClaim(PaymentOptionType.INSTALMENTS));

      expect(values).toContain('COMMON.PAYMENT_OPTION.INSTALMENTS');
      expect(values).toContain('£150');
      expect(values).toContain('COMMON.PAYMENT_FREQUENCY.WEEK');
    });
  });

  describe('Submission payload shape', () => {
    const mockSubmitDependencies = (claim: Claim): void => {
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
    };

    it('submits defendant part-admit already-paid payload to civil service', async () => {
      const claim = buildPartAdmitAlreadyPaidClaim();
      const req = {params: {id: '12345'}} as never;
      mockSubmitDependencies(claim);
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        respondent1ClaimResponseTypeForSpec: ResponseType.PART_ADMISSION,
        specDefenceAdmittedRequired: 'Yes',
        respondToAdmittedClaim: expect.anything(),
      }));
    });

    it('submits defendant part-admit immediate-payment payload to civil service', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
      const req = {params: {id: '12345'}} as never;
      mockSubmitDependencies(claim);
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        respondent1ClaimResponseTypeForSpec: ResponseType.PART_ADMISSION,
        specDefenceAdmittedRequired: 'No',
        defenceAdmitPartPaymentTimeRouteRequired: PaymentOptionType.IMMEDIATELY,
      }));
    });

    it('submits defendant part-admit by-set-date payload to civil service', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
      const req = {params: {id: '12345'}} as never;
      mockSubmitDependencies(claim);
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        defenceAdmitPartPaymentTimeRouteRequired: PaymentOptionType.BY_SET_DATE,
        respondToClaimAdmitPartLRspec: expect.anything(),
      }));
    });

    it('submits defendant part-admit instalments payload to civil service', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.INSTALMENTS);
      const req = {params: {id: '12345'}} as never;
      mockSubmitDependencies(claim);
      civilServiceClientMock.submitDefendantResponseEvent.mockResolvedValue(claim);

      await submitResponse(req);

      const payload = civilServiceClientMock.submitDefendantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        defenceAdmitPartPaymentTimeRouteRequired: 'SUGGESTION_OF_REPAYMENT_PLAN',
        respondent1RepaymentPlan: expect.anything(),
      }));
    });

    it('submits claimant part-admit accept payload for small-claim/fast-track flows', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
      claim.claimantResponse = {
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        chooseHowToProceed: {option: ChooseHowProceed.REQUEST_A_CCJ},
      } as never;
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD')
        .mockResolvedValue({ccjMergedField: 'yes'} as never);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
        applicant1AcceptPartAdmitPaymentPlanSpec: 'Yes',
        ccjMergedField: 'yes',
      }));
    });

    it('submits claimant part-admit alternative repayment proposal payload', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.INSTALMENTS);
      claim.claimantResponse = {
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.NO},
        hasPartPaymentBeenAccepted: {option: YesNo.NO},
        suggestedPaymentIntention: {
          paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: {
            paymentAmount: 120,
            repaymentFrequency: 'WEEK',
            firstRepaymentDate: new Date('2026-07-10'),
          },
        },
      } as never;
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
        applicant1AcceptPartAdmitPaymentPlanSpec: 'No',
        applicant1RepaymentOptionForDefendantSpec: expect.anything(),
        applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: expect.anything(),
      }));
    });

    it('submits claimant part-admit reject payload for small-claim/fast-track flows', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.INSTALMENTS);
      claim.claimantResponse = {
        hasPartAdmittedBeenAccepted: {option: YesNo.NO},
        hasPartPaymentBeenAccepted: {option: YesNo.NO},
      } as never;
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'No',
        applicant1PartAdmitIntentionToSettleClaimSpec: 'No',
      }));
    });

    it('submits claimant part-admit immediate-payment accept and settle payload', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
      claim.claimantResponse = Object.assign(new ClaimantResponse(), {
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        hasPartPaymentBeenAccepted: {option: YesNo.YES},
      });
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
        applicant1AcceptPartAdmitPaymentPlanSpec: 'Yes',
        applicant1PartAdmitIntentionToSettleClaimSpec: 'Yes',
      }));
      expect(payload.respondToClaimAdmitPartLRspec).toBeUndefined();
    });

    it('submits claimant part-admit immediate-payment reject payload when defendant offered immediate payment', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.IMMEDIATELY);
      claim.responseClaimTrack = 'FAST_CLAIM' as never;
      claim.claimantResponse = {
        hasPartAdmittedBeenAccepted: {option: YesNo.NO},
        hasPartPaymentBeenAccepted: {option: YesNo.NO},
      } as never;
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'No',
        applicant1PartAdmitIntentionToSettleClaimSpec: 'No',
      }));
    });

    it('submits claimant part-admit settlement-agreement path without CCJ merge', async () => {
      const claim = buildPartAdmitClaim(PaymentOptionType.BY_SET_DATE);
      claim.claimantResponse = {
        hasPartAdmittedBeenAccepted: {option: YesNo.YES},
        fullAdmitSetDateAcceptPayment: {option: YesNo.YES},
        chooseHowToProceed: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT},
      } as never;
      const req = {params: {id: '12345'}} as never;
      const ccjSpy = jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD');
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptPartAdmitPaymentPlanSpec: 'Yes',
      }));
      expect(ccjSpy).not.toHaveBeenCalled();
    });

    it('includes small-claim DQ hearing fields in claimant payload when claim is small-claim track', async () => {
      const claim = buildClaimantResponseClaimForTrack('SMALL_CLAIM');
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD')
        .mockResolvedValue({ccjMergedField: 'yes'} as never);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
        applicant1DQSmallClaimHearing: expect.anything(),
      }));
    });

    it('does not include small-claim DQ hearing fields in claimant payload when claim is fast-track', async () => {
      const claim = buildClaimantResponseClaimForTrack('FAST_CLAIM');
      const req = {params: {id: '12345'}} as never;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      jest.spyOn(claimantCcjTranslationService, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD')
        .mockResolvedValue({ccjMergedField: 'yes'} as never);
      civilServiceClientMock.submitClaimantResponseEvent.mockResolvedValue(claim);

      await submitClaimantResponse(req);

      const payload = civilServiceClientMock.submitClaimantResponseEvent.mock.calls[0][1];
      expect(payload).toEqual(expect.objectContaining({
        applicant1AcceptAdmitAmountPaidSpec: 'Yes',
      }));
      expect(payload.applicant1DQSmallClaimHearing).toBeUndefined();
    });
  });

  describe('Dashboard notification/status mapping checks', () => {
    it('maps mediation, judgment and NOC-related statuses for claimant/defendant dashboards', () => {
      const claimantItem = new DashboardClaimantItem();
      claimantItem.status = 'IN_MEDIATION';
      const defendantItem = new DashboardDefendantItem();
      defendantItem.status = 'REQUESTED_COUNTRY_COURT_JUDGEMENT';
      defendantItem.claimantName = 'Test Claimant';
      defendantItem.ccjRequestedDate = new Date('2026-07-01');
      const nocDefendantItem = new DashboardDefendantItem();
      nocDefendantItem.status = 'DEFENDANT_APPLY_NOC';

      expect(claimantItem.getStatus('en')).toBe('PAGES.DASHBOARD.STATUS_CLAIMANT.IN_MEDIATION');
      expect(defendantItem.getStatus('en')).toBe('PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIMANT_REQUESTED_CCJ');
      expect(nocDefendantItem.getStatus('en')).toBe('PAGES.DASHBOARD.STATUS_DEFENDANT.RESPONSE_BY_POST');
    });
  });
});
