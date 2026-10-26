import request from 'supertest';
import express from 'express';
import session from 'express-session';
import {JSDOM} from 'jsdom';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  CLAIMANT_RESPONSE_CONFIRMATION_URL,
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../../main/routes/urls';
import {t} from 'i18next';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {translateCCDCaseDataToCUIModel} from '../../../main/services/translation/convertToCUI/cuiTranslation';
import {CCDClaim} from '../../../main/common/models/civilClaimResponse';
import {CCDParty} from '../../../main/common/models/ccdResponse/ccdParty';
import {PartyType} from '../../../main/common/models/partyType';
import {CCDPaymentOption} from '../../../main/common/models/ccdResponse/ccdPaymentOption';
import {CCDClaimantPaymentOption} from '../../../main/common/models/ccdResponse/ccdClaimantPaymentOption';
import {CCDChoosesHowToProceed} from '../../../main/services/translation/claimantResponse/convertToCCDClaimantLiPResponse';
import {getTTLDaysForCategory, TTLCategory} from '../../../main/modules/draft-store/ttlConfig';
import {
  createClaimWithBasicApplicantDetails,
  createClaimWithFullRejection,
} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {
  isCarmEnabledForCase,
  isMintiEnabledForCase,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {RejectAllOfClaimType} from '../../../main/common/form/models/rejectAllOfClaimType';
import {GenericYesNo} from '../../../main/common/form/models/genericYesNo';
import {YesNo, YesNoUpperCamelCase} from '../../../main/common/form/models/yesNo';
import {CaseState} from '../../../main/common/form/models/claimDetails';
import {Claim} from '../../../main/common/models/claim';
import {ClaimantResponse} from '../../../main/common/models/claimantResponse';
import {AppSession} from '../../../main/common/models/AppRequest';
import {PaymentOptionType} from '../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from '../../../main/common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {CCDRepaymentPlanFrequency} from '../../../main/common/models/ccdResponse/ccdRepaymentPlan';
import {RepaymentDecisionType} from '../../../main/common/models/claimantResponse/RepaymentDecisionType';
import {SignSettlmentAgreement} from '../../../main/common/form/models/claimantResponse/signSettlementAgreement';

const CLAIM_ID = '000MC456';
const SUBMITTED_DATE = '2026-02-03T09:00:00.000Z';

const route = (url: string, claimId = CLAIM_ID): string => url.replace(':id', claimId);

const createDraftStoreClient = (claim: Claim) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    id: claim.id,
    case_data: claim,
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
});

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = createDraftStoreClient(claim);
};

const withCommonClaimMetadata = (claim: Claim): Claim => {
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = new Date(SUBMITTED_DATE);
  claim.applicant1 = createClaimWithBasicApplicantDetails().applicant1;
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  return claim;
};

const buildDisputeClaim = (intentionToProceed: YesNo) => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE));
  claim.totalClaimAmount = 9000;
  claim.claimantResponse = Object.assign(new ClaimantResponse(), {
    intentionToProceed: new GenericYesNo(intentionToProceed),
  });
  claim.mediation = {
    canWeUse: {
      option: YesNo.YES,
      mediationPhoneNumber: '07111111111',
    },
    companyTelephoneNumber: {},
  };
  return claim;
};

const buildAlreadyPaidInFullClaim = (settled: YesNo) => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 1000));
  claim.totalClaimAmount = 1000;
  claim.claimantResponse = Object.assign(new ClaimantResponse(), {
    hasFullDefenceStatesPaidClaimSettled: new GenericYesNo(settled),
  });
  claim.mediation = {
    canWeUse: {
      option: YesNo.YES,
      mediationPhoneNumber: '07111111111',
    },
    companyTelephoneNumber: {},
  };
  return claim;
};

const buildAlreadyPaidLessClaim = (settled: YesNo) => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 500));
  claim.totalClaimAmount = 1000;
  claim.claimantResponse = Object.assign(new ClaimantResponse(), {
    hasDefendantPaidYou: new GenericYesNo(YesNo.YES),
    hasPartPaymentBeenAccepted: new GenericYesNo(settled),
    rejectionReason: settled === YesNo.NO ? {text: 'The remaining balance is still owed'} : undefined,
  });
  claim.mediation = {
    canWeUse: {
      option: YesNo.YES,
      mediationPhoneNumber: '07111111111',
    },
    companyTelephoneNumber: {},
  };
  return claim;
};

const expectTaskList = (res: request.Response, includes: string[], excludes: string[] = []): void => {
  expect(res.status).toBe(200);
  includes.forEach(text => expect(res.text).toContain(text));
  excludes.forEach(text => expect(res.text).not.toContain(text));
};

describe('Integration: claimant reject-all branching', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders the dispute-all non-CARM task list when the claimant proceeds', async () => {
    setDraftClaim(buildDisputeClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['How they responded', 'Choose what to do next', 'Decide whether to proceed', 'Free telephone mediation', 'Give us details in case there&#39;s a hearing'],
          ['Telephone mediation', 'Availability for mediation'],
        );
      });
  });

  it('renders the dispute-all CARM task list when the claimant proceeds', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    setDraftClaim(buildDisputeClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Decide whether to proceed', 'Free telephone mediation', 'Mediation', 'Telephone mediation', 'Availability for mediation', 'Give us details in case there&#39;s a hearing'],
        );
      });
  });

  it('removes mediation and hearing tasks when the claimant does not proceed after a dispute-all response', async () => {
    setDraftClaim(buildDisputeClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Decide whether to proceed'],
          ['Free telephone mediation', 'Telephone mediation', 'Availability for mediation', 'Give us details in case there\'s a hearing'],
        );
      });
  });

  it('shows the settled already-paid outcome without extra task-list branches', async () => {
    setDraftClaim(buildAlreadyPaidInFullClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Accept or reject their response'],
          ['Free telephone mediation', 'Telephone mediation', 'Availability for mediation'],
        );
      });
  });

  it('shows the rejected already-paid outcome with a follow-on mediation task', async () => {
    setDraftClaim(buildAlreadyPaidInFullClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Accept or reject their response', 'Free telephone mediation'],
          ['Telephone mediation', 'Availability for mediation'],
        );
      });
  });

  it('shows the already-paid-less settled outcome after the claimant confirms payment', async () => {
    setDraftClaim(buildAlreadyPaidLessClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Have you been paid the £500?', 'Settle the claim for £500?'],
          ['Accept or reject their response', 'Free telephone mediation', 'Telephone mediation', 'Availability for mediation', 'Give us details in case there&#39;s a hearing'],
        );
      });
  });

  it('shows the already-paid-less rejected outcome with non-CARM mediation and hearing tasks', async () => {
    setDraftClaim(buildAlreadyPaidLessClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Have you been paid the £500?', 'Settle the claim for £500?', 'Free telephone mediation', 'Give us details in case there&#39;s a hearing'],
          ['Accept or reject their response', 'Telephone mediation', 'Availability for mediation'],
        );
      });
  });

  it('shows the already-paid-less rejected outcome with explicit CARM mediation tasks', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    setDraftClaim(buildAlreadyPaidLessClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expectTaskList(
          res,
          ['Have you been paid the £500?', 'Settle the claim for £500?', 'Mediation', 'Telephone mediation', 'Availability for mediation', 'Give us details in case there&#39;s a hearing'],
          ['Accept or reject their response', 'Free telephone mediation'],
        );
      });
  });
});

describe('Integration: claimant-response navigation and cache recovery', () => {
  const id = '1645882162449409';
  const redisKey = `${id}local-user`;
  const otherUserKey = `${id}another-user`;
  const signedInApp = express();
  signedInApp.use(session({secret: 'claimant-response-integration', resave: false, saveUninitialized: false}));
  signedInApp.use((req, _res, next) => {
    (req.session as AppSession).user = {id: 'local-user'} as AppSession['user'];
    next();
  });
  signedInApp.use(app);
  let originalStore: typeof app.locals.draftStoreClient;
  let entries: Map<string, string>;
  let writes: {key: string; value: {case_data: Claim}; mode: string; ttl: number}[];

  const ccdParty = (firstName: string): CCDParty => ({
    type: PartyType.INDIVIDUAL,
    individualTitle: 'Mr',
    individualFirstName: firstName,
    individualLastName: 'Example',
    individualDateOfBirth: undefined,
    companyName: undefined,
    organisationName: undefined,
    partyEmail: `${firstName.toLowerCase()}@example.com`,
    partyPhone: '07111111111',
    primaryAddress: {AddressLine1: '1 Test Road', AddressLine2: '', AddressLine3: '', PostTown: 'London', PostCode: 'SW1A 1AA'},
    soleTraderDateOfBirth: undefined,
    soleTraderFirstName: undefined,
    soleTraderLastName: undefined,
    soleTraderTitle: undefined,
    soleTraderTradingAs: undefined,
  });

  const ccdClaim = (): CCDClaim => ({
    legacyCaseReference: '000MC456',
    ccdState: CaseState.AWAITING_APPLICANT_INTENTION,
    submittedDate: new Date(SUBMITTED_DATE),
    applicant1ResponseDate: new Date('2026-02-04T09:00:00.000Z'),
    applicant1: ccdParty('Alice'),
    respondent1: ccdParty('Bob'),
    respondent1ClaimResponseTypeForSpec: 'FULL_ADMISSION',
    totalClaimAmount: 1000,
    defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.BY_SET_DATE,
    applicant1AcceptFullAdmitPaymentPlanSpec: YesNoUpperCamelCase.NO,
    applicant1RepaymentOptionForDefendantSpec: CCDClaimantPaymentOption.IMMEDIATELY,
    applicant1LiPResponse: {applicant1ChoosesHowToProceed: CCDChoosesHowToProceed.SIGN_A_SETTLEMENT_AGREEMENT},
  });

  // Match the client's envelope mapping after translating the real CCD case_data.
  const restoredClaim = (): Claim => Object.assign(translateCCDCaseDataToCUIModel(ccdClaim()), {id});

  const completePaymentChoice = (paymentOption: PaymentOptionType, partialAdmission = false): Claim => {
    const data = ccdClaim();
    if (partialAdmission) {
      data.respondent1ClaimResponseTypeForSpec = 'PART_ADMISSION';
      data.respondToAdmittedClaimOwingAmountPounds = '750';
      data.specDefenceAdmittedRequired = YesNoUpperCamelCase.NO;
      data.applicant1AcceptAdmitAmountPaidSpec = YesNoUpperCamelCase.YES;
      data.applicant1AcceptPartAdmitPaymentPlanSpec = YesNoUpperCamelCase.NO;
    }
    const claim = Object.assign(translateCCDCaseDataToCUIModel(data), {id});
    claim.claimantResponse.defendantResponseViewed = true;
    claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
    claim.claimantResponse.signSettlementAgreement = new SignSettlmentAgreement('true');
    claim.claimantResponse.suggestedPaymentIntention = {
      paymentOption,
      paymentDate: new PaymentDate('2032', '6', '14') as unknown as Date,
      repaymentPlan: {paymentAmount: 100, repaymentFrequency: 'MONTH', firstRepaymentDate: new Date('2032-06-14')},
    };
    return claim;
  };

  const changeLink = (html: string, question: string): string => {
    const dom = new JSDOM(html);
    try {
      const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
      const rows = Array.from(dom.window.document.querySelectorAll('.govuk-summary-list__row'));
      const row = rows.find(row => normalize(row.querySelector('dt')?.textContent ?? '') === normalize(question));
      expect(row).toBeDefined();
      const link = row.querySelector('.govuk-summary-list__actions a');
      expect(link).not.toBeNull();
      return link.getAttribute('href');
    } finally {
      dom.window.close();
    }
  };

  const instalmentFields = (html: string) => {
    const dom = new JSDOM(html);
    try {
      const input = (name: string) => dom.window.document.querySelector<HTMLInputElement>(`input[name="${name}"]`).value;
      return {
        paymentAmount: input('paymentAmount'),
        repaymentFrequency: dom.window.document.querySelector<HTMLInputElement>('input[name="repaymentFrequency"]:checked')?.value ?? '',
        day: input('day'), month: input('month'), year: input('year'),
      };
    } finally {
      dom.window.close();
    }
  };

  beforeEach(() => {
    originalStore = app.locals.draftStoreClient;
    entries = new Map([[otherUserKey, 'unrelated draft']]);
    writes = [];
    app.locals.draftStoreClient = {
      get: jest.fn(async (key: string) => entries.get(key) ?? null),
      set: jest.fn(async (key: string, value: string, mode: string, ttl: number) => {
        writes.push({key, value: JSON.parse(value), mode, ttl});
        entries.set(key, value);
        return 'OK';
      }),
      del: jest.fn(async (key: string) => Number(entries.delete(key))),
      ttl: jest.fn(async (key: string) => entries.has(key) ? 3600 : -2),
    };
    civilServiceClientMock.retrieveClaimDetails.mockReset().mockImplementation(async () => restoredClaim());
    civilServiceClientMock.calculateExtendedResponseDeadline.mockReset().mockResolvedValue(new Date('2026-02-11T09:00:00.000Z'));
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  afterEach(() => {
    app.locals.draftStoreClient = originalStore;
    civilServiceClientMock.retrieveClaimDetails.mockReset();
    civilServiceClientMock.calculateExtendedResponseDeadline.mockReset();
  });

  it.each(['en', 'cy'])('restores a copied confirmation URL and subsequent task list with a cold cache in %s', async lang => {
    const expectedResponse = JSON.parse(JSON.stringify(translateCCDCaseDataToCUIModel(ccdClaim()).claimantResponse));

    const confirmation = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CONFIRMATION_URL, id)}?lang=${lang}`).expect(200);

    expect(confirmation.text).toContain(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE', {lng: lang}));
    expect(confirmation.text).toContain('000MC456');
    expect(writes).toHaveLength(2); // The outer guard hydrates a cold cache before the controller refreshes it.
    expect(writes.every(write => write.key === redisKey && write.mode === 'EX'
      && Math.abs(write.ttl - getTTLDaysForCategory(TTLCategory.JOURNEY_CACHE) * 86400) <= 1)).toBe(true);
    expect(writes.map(write => write.value.case_data.claimantResponse)).toEqual([expectedResponse, expectedResponse]);

    const taskList = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_TASK_LIST_URL, id)}?lang=${lang}`).expect(200);

    expect(taskList.text).toContain(`href="${route(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, id)}"`);
    expect(JSON.parse(entries.get(redisKey)).case_data.claimantResponse).toEqual(expectedResponse);
    expect(entries.get(otherUserKey)).toBe('unrelated draft');
    expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
    expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
  });

  it.each(['en', 'cy'])('retains the CCD response if the cache expires after the confirmation guard in %s', async lang => {
    civilServiceClientMock.retrieveClaimDetails.mockImplementation(async () => {
      // A real TTL can expire between the outer guard's hydration and the refresh's cache read.
      if (civilServiceClientMock.retrieveClaimDetails.mock.calls.length === 2) entries.delete(redisKey);
      return restoredClaim();
    });
    const expectedResponse = JSON.parse(JSON.stringify(translateCCDCaseDataToCUIModel(ccdClaim()).claimantResponse));

    const confirmation = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CONFIRMATION_URL, id)}?lang=${lang}`).expect(200);

    expect(confirmation.text).toContain(t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.SIGN_SETTLEMENT_AGREEMENT.TITLE', {lng: lang}));
    expect(civilServiceClientMock.retrieveClaimDetails).toHaveBeenCalledTimes(3);
    expect(writes).toHaveLength(2);
    expect(writes[1].key).toBe(redisKey);
    expect(writes[1].value.case_data.claimantResponse).toEqual(expectedResponse);
    expect(writes[1].mode).toBe('EX');
    expect(Math.abs(writes[1].ttl - getTTLDaysForCategory(TTLCategory.JOURNEY_CACHE) * 86400)).toBeLessThanOrEqual(1);

    await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_TASK_LIST_URL, id)}?lang=${lang}`).expect(200);

    expect(JSON.parse(entries.get(redisKey)).case_data.claimantResponse).toEqual(expectedResponse);
    expect(entries.get(otherUserKey)).toBe('unrelated draft');
    expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
    expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
  });

  it.each(['en', 'cy'])('preserves a cached in-progress response rather than replacing it with CCD answers in %s', async lang => {
    const cached = restoredClaim();
    cached.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
    const expectedResponse = JSON.parse(JSON.stringify(cached.claimantResponse));
    entries.set(redisKey, JSON.stringify({id: redisKey, case_data: cached}));

    await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CONFIRMATION_URL, id)}?lang=${lang}`).expect(200);
    await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_TASK_LIST_URL, id)}?lang=${lang}`).expect(200);

    expect(writes).toHaveLength(1);
    expect(writes[0].key).toBe(redisKey);
    expect(writes[0].value.case_data.claimantResponse).toEqual(expectedResponse);
    expect(JSON.parse(entries.get(redisKey)).case_data.claimantResponse).toEqual(expectedResponse);
    expect(entries.get(otherUserKey)).toBe('unrelated draft');
    expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
    expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
  });

  describe.each(['en', 'cy'])('claimant repayment choices in %s', lang => {
    it.each([PaymentOptionType.IMMEDIATELY, PaymentOptionType.INSTALMENTS, PaymentOptionType.BY_SET_DATE])('follows the full-admission %s Change link to the claimant payment-option page', async paymentOption => {
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: completePaymentChoice(paymentOption)}));

      const summary = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, id)}?lang=${lang}`).expect(200);
      const href = changeLink(summary.text, t('PAGES.CHECK_YOUR_ANSWER.HOW_DO_WANT_TO_DEFENDANT_TO_PAY', {lng: lang}));
      expect(href).toBe(route(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, id));

      const paymentOptions = await request(signedInApp).get(`${href}?lang=${lang}`).expect(200);
      const dom = new JSDOM(paymentOptions.text);
      try {
        expect(dom.window.document.querySelector('h1').textContent.trim()).toBe(t('PAGES.CLAIMANT_RESPONSE_PAYMENT_OPTION.TITLE', {lng: lang}));
        expect(Array.from(dom.window.document.querySelectorAll<HTMLInputElement>('input[name="paymentType"]')).map(input => input.value))
          .toEqual([PaymentOptionType.IMMEDIATELY, PaymentOptionType.BY_SET_DATE, PaymentOptionType.INSTALMENTS]);
        expect(paymentOptions.text).not.toContain('£NaN');
      } finally {
        dom.window.close();
      }
      expect(entries.get(otherUserKey)).toBe('unrelated draft');
      expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
      expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
    });

    it('follows each instalment-detail Change link without clearing the saved proposal', async () => {
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: completePaymentChoice(PaymentOptionType.INSTALMENTS)}));
      const original = entries.get(redisKey);
      const summary = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, id)}?lang=${lang}`).expect(200);

      for (const question of ['REGULAR_PAYMENTS', 'FREQUENCY_OF_PAYMENTS', 'DATE_FOR_FIRST_INSTALMENT']) {
        const href = changeLink(summary.text, t(`PAGES.CHECK_YOUR_ANSWER.${question}`, {lng: lang}));
        expect(href).toBe(route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id));
        const plan = await request(signedInApp).get(`${href}?lang=${lang}`).expect(200);
        expect(instalmentFields(plan.text)).toEqual({paymentAmount: '100', repaymentFrequency: 'MONTH', day: '14', month: '6', year: '2032'});
      }
      expect(entries.get(redisKey)).toBe(original);
    });

    it('keeps the partial-admission acceptance Change link on the settlement page', async () => {
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: completePaymentChoice(PaymentOptionType.IMMEDIATELY, true)}));
      const summary = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, id)}?lang=${lang}`).expect(200);
      const href = changeLink(summary.text, t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', {lng: lang}));
      expect(href).toBe(route(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, id));

      const settlement = await request(signedInApp).get(`${href}?lang=${lang}`).expect(200);
      const dom = new JSDOM(settlement.text);
      try {
        expect(dom.window.document.querySelector('h1').textContent).toContain('£750');
        expect(dom.window.document.querySelector<HTMLInputElement>('input[name="option"]:checked').value).toBe(YesNo.YES);
        expect(settlement.text).not.toContain('£NaN');
      } finally {
        dom.window.close();
      }
    });

    it.each([undefined, null, 'not-a-date', '2032-06-14'])('reconstructs CCD instalment date %s after cold-cache hydration without losing amount or frequency', async savedDate => {
      const data: CCDClaim = {
        ...ccdClaim(),
        applicant1RepaymentOptionForDefendantSpec: CCDClaimantPaymentOption.REPAYMENT_PLAN,
        applicant1SuggestInstalmentsPaymentAmountForDefendantSpec: 100,
        applicant1SuggestInstalmentsRepaymentFrequencyForDefendantSpec: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
        applicant1SuggestInstalmentsFirstRepaymentDateForDefendantSpec: savedDate,
      };
      civilServiceClientMock.retrieveClaimDetails.mockImplementation(async () => Object.assign(translateCCDCaseDataToCUIModel(data), {id}));

      const response = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id)}?lang=${lang}`).expect(200);

      expect(instalmentFields(response.text)).toEqual({
        paymentAmount: '100', repaymentFrequency: 'MONTH',
        day: savedDate === '2032-06-14' ? '14' : '',
        month: savedDate === '2032-06-14' ? '6' : '',
        year: savedDate === '2032-06-14' ? '2032' : '',
      });
      expect(civilServiceClientMock.retrieveClaimDetails).toHaveBeenCalledTimes(1);
      expect(writes).toHaveLength(1);
      expect(writes[0].key).toBe(redisKey);
      expect(writes[0].mode).toBe('EX');
      expect(writes[0].value.case_data.claimantResponse.suggestedPaymentIntention.repaymentPlan).toEqual({
        paymentAmount: 100, repaymentFrequency: 'MONTH',
        ...(savedDate === '2032-06-14' ? {firstRepaymentDate: '2032-06-14T00:00:00.000Z'} : {}),
      });
      expect(entries.get(otherUserKey)).toBe('unrelated draft');
      expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
      expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
    });

    it('leaves an older cached null date blank without changing the saved amount and frequency', async () => {
      const claim = completePaymentChoice(PaymentOptionType.INSTALMENTS);
      claim.claimantResponse.suggestedPaymentIntention.repaymentPlan.firstRepaymentDate = null;
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: claim}));
      const original = entries.get(redisKey);

      const plan = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id)}?lang=${lang}`).expect(200);

      expect(instalmentFields(plan.text)).toEqual({paymentAmount: '100', repaymentFrequency: 'MONTH', day: '', month: '', year: ''});
      expect(entries.get(redisKey)).toBe(original);
      expect(writes).toHaveLength(0);
      expect(civilServiceClientMock.retrieveClaimDetails).not.toHaveBeenCalled();
    });

    it('opens a blank instalment plan through the normal payment-option journey', async () => {
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: completePaymentChoice(PaymentOptionType.INSTALMENTS)}));
      await request(signedInApp).get(route(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, id)).expect(200);
      await request(signedInApp).post(route(CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, id))
        .send({paymentType: PaymentOptionType.INSTALMENTS}).expect(302).expect('Location', route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id));

      const plan = await request(signedInApp).get(`${route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id)}?lang=${lang}`).expect(200);

      expect(instalmentFields(plan.text)).toEqual({paymentAmount: '', repaymentFrequency: '', day: '', month: '', year: ''});
      expect(JSON.parse(entries.get(redisKey)).case_data.claimantResponse.suggestedPaymentIntention).toEqual({paymentOption: PaymentOptionType.INSTALMENTS});
    });

    it('redisplays invalid POST date parts and entered payment values without overwriting the saved plan', async () => {
      entries.set(redisKey, JSON.stringify({id: redisKey, case_data: completePaymentChoice(PaymentOptionType.INSTALMENTS)}));
      const original = entries.get(redisKey);

      const response = await request(signedInApp).post(`${route(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, id)}?lang=${lang}`)
        .send({paymentAmount: '65', repaymentFrequency: 'MONTH', year: '2032', month: '', day: '12'}).expect(200);

      expect(instalmentFields(response.text)).toEqual({paymentAmount: '65', repaymentFrequency: 'MONTH', day: '12', month: '', year: '2032'});
      const dom = new JSDOM(response.text);
      try {
        expect(dom.window.document.querySelector('.govuk-error-summary a[href="#month"]')).not.toBeNull();
      } finally {
        dom.window.close();
      }
      expect(entries.get(redisKey)).toBe(original);
      expect(writes).toHaveLength(0);
      expect(civilServiceClientMock.submitClaimantResponseEvent).not.toHaveBeenCalled();
      expect(civilServiceClientMock.submitEvent).not.toHaveBeenCalled();
    });
  });
});
