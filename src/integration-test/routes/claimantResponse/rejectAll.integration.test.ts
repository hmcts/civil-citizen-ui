import request from 'supertest';
import express from 'express';
import session from 'express-session';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, CLAIMANT_RESPONSE_CONFIRMATION_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../main/routes/urls';
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

describe('Integration: claimant confirmation and cache expiry', () => {
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
});
