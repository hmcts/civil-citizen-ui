import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('routes/guards/allResponseTasksCompletedGuard', () => ({
  AllResponseTasksCompletedGuard: {
    apply: () => (_req, _res, next) => next(),
  },
}));

jest.mock('routes/guards/pcqGuard', () => ({
  isFirstTimeInPCQ: (_req, _res, next) => next(),
}));

jest.mock('services/features/common/responseDeadlineAgreedService', () => ({
  setResponseDeadline: jest.fn().mockResolvedValue(undefined),
}));

import {app} from '../../../main/app';
import {
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_CONFIRM_YOUR_DETAILS_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_UNAVAILABLE_FOR_HEARING_URL,
  RESPONSE_CHECK_ANSWERS_URL,
  RESPONSE_TASK_LIST_URL,
  RESPONSE_YOUR_DEFENCE_URL,
} from '../../../main/routes/urls';
import {
  createClaimWithBasicApplicantDetails,
  createClaimWithFullRejection,
} from '../../../test/utils/mockClaimForCheckAnswers';
import {mockDefendantResponseSmallClaimFullReject} from '../../../test/utils/mockDraftStore';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {
  isCarmEnabledForCase,
  isMintiEnabledForCase,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {RejectAllOfClaimType} from '../../../main/common/form/models/rejectAllOfClaimType';
import {DefendantTimeline} from '../../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from '../../../main/common/form/models/timeLineOfEvents/timelineRow';
import {Evidence} from '../../../main/common/form/models/evidence/evidence';
import {EvidenceItem} from '../../../main/common/form/models/evidence/evidenceItem';
import {EvidenceType} from '../../../main/common/models/evidence/evidenceType';
import {GenericYesNo} from '../../../main/common/form/models/genericYesNo';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {MediationCarm} from '../../../main/common/models/mediation/mediationCarm';
import {UnavailableDateType} from '../../../main/common/models/directionsQuestionnaire/hearing/unavailableDates';
import {PartyType} from '../../../main/common/models/partyType';

const CLAIM_ID = '000MC123';
const FUTURE_RESPONSE_DEADLINE = new Date('2050-05-15T00:00:00.000Z');
const SUBMITTED_DATE = '2026-01-02T09:00:00.000Z';

const route = (url: string, claimId = CLAIM_ID): string => url.replace(':id', claimId);

const createDraftStoreClient = (claim) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    id: claim.id,
    case_data: claim,
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
});

const setDraftClaim = (claim) => {
  app.locals.draftStoreClient = createDraftStoreClient(claim);
};

const withCommonClaimMetadata = (claim) => {
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = SUBMITTED_DATE;
  claim.respondent1ResponseDeadline = FUTURE_RESPONSE_DEADLINE;
  claim.applicant1 = createClaimWithBasicApplicantDetails().applicant1;
  return claim;
};

const buildRejectAllDisputeClaim = () => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE));
  claim.totalClaimAmount = 9000;
  claim.rejectAllOfClaim = {
    ...claim.rejectAllOfClaim,
    defence: {
      text: 'The claim amount is disputed in full.',
    },
  };
  return claim;
};

const buildRejectAllAlreadyPaidLessClaim = () => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID, 800));
  claim.totalClaimAmount = 1000;
  claim.rejectAllOfClaim = {
    ...claim.rejectAllOfClaim,
    timeline: new DefendantTimeline([
      new TimelineRow(1, 1, 2024, 'Invoice sent'),
      new TimelineRow(14, 2, 2024, 'Payment made'),
    ], 'Timeline note'),
  } as typeof claim.rejectAllOfClaim;
  claim.evidence = new Evidence('Evidence note', [
    new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Contract bundle'),
  ]);
  claim.mediationCarm = new MediationCarm();
  claim.mediationCarm.hasTelephoneMeditationAccessed = true;
  claim.mediationCarm.hasAvailabilityMediationFinished = true;
  claim.mediationCarm.isMediationPhoneCorrect = new GenericYesNo(YesNo.NO);
  claim.mediationCarm.alternativeMediationTelephone = {alternativeTelephone: '07000000000'};
  claim.mediationCarm.isMediationEmailCorrect = new GenericYesNo(YesNo.NO);
  claim.mediationCarm.alternativeMediationEmail = {alternativeEmailAddress: 'alt@example.com'};
  claim.mediationCarm.hasUnavailabilityNextThreeMonths = new GenericYesNo(YesNo.YES);
  claim.mediationCarm.unavailableDatesForMediation = {
    items: [
      {
        date: new Date('2024-01-01T00:00:00.000Z'),
        from: new Date('2024-01-01T00:00:00.000Z'),
        until: new Date('2024-01-02T00:00:00.000Z'),
        unavailableDateType: UnavailableDateType.SINGLE_DATE,
      },
    ],
  };
  return claim;
};

const buildFutureSingleUnavailableDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return {
    items: [{
      type: UnavailableDateType.SINGLE_DATE,
      single: {
        start: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      },
    }],
  };
};

const buildLongUnavailablePeriod = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 31);
  return {
    items: [{
      type: UnavailableDateType.LONGER_PERIOD,
      period: {
        start: {
          day: start.getDate(),
          month: start.getMonth() + 1,
          year: start.getFullYear(),
        },
        end: {
          day: end.getDate(),
          month: end.getMonth() + 1,
          year: end.getFullYear(),
        },
      },
    }],
  };
};

describe('Integration: reject-all response coverage', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  it('renders the reject-all dispute task list with the non-CARM mediation path', async () => {
    app.locals.draftStoreClient = mockDefendantResponseSmallClaimFullReject;

    await request(app)
      .get(route(RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Tell us why you disagree with the claim');
        expect(res.text).toContain('Free telephone mediation');
        expect(res.text).toContain('Give us details in case there&#39;s a hearing');
        expect(res.text).not.toContain('Telephone mediation');
        expect(res.text).not.toContain('Availability for mediation');
      });
  });

  it('renders the reject-all dispute task list with explicit CARM tasks', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    app.locals.draftStoreClient = mockDefendantResponseSmallClaimFullReject;

    await request(app)
      .get(route(RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Tell us why you disagree with the claim');
        expect(res.text).toContain('Telephone mediation');
        expect(res.text).toContain('Availability for mediation');
        expect(res.text).not.toContain('Free telephone mediation');
      });
  });

  it('renders reject-all check answers with timeline, evidence, and CARM mediation details', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    setDraftClaim(buildRejectAllAlreadyPaidLessClaim());

    await request(app)
      .get(route(RESPONSE_CHECK_ANSWERS_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Check your answers');
        expect(res.text).toContain('Invoice sent');
        expect(res.text).toContain('Timeline note');
        expect(res.text).toContain('Contract bundle');
        expect(res.text).toContain('Evidence note');
        expect(res.text).toContain('Availability for mediation');
        expect(res.text).toContain('07000000000');
        expect(res.text).toContain('alt@example.com');
        expect(res.text).toContain('Reasons for disagree');
      });
  });

  it('moves the dispute branch from defence to timeline to evidence to task list', async () => {
    const claim = buildRejectAllDisputeClaim();
    setDraftClaim(claim);
    await request(app)
      .post(route(RESPONSE_YOUR_DEFENCE_URL))
      .send({text: 'A detailed defence for the reject-all dispute branch'})
      .expect(302)
      .expect('Location', route(CITIZEN_TIMELINE_URL));

    setDraftClaim(claim);
    await request(app)
      .post(route(CITIZEN_TIMELINE_URL))
      .send({
        rows: [{
          day: 17,
          month: 11,
          year: 2024,
          description: 'Payment dispute raised',
        }],
        comment: 'Timeline comment',
      })
      .expect(302)
      .expect('Location', route(CITIZEN_EVIDENCE_URL));

    setDraftClaim(claim);
    await request(app)
      .post(route(CITIZEN_EVIDENCE_URL))
      .send({
        comment: 'Evidence comment',
        evidenceItem: [{
          type: EvidenceType.CONTRACTS_AND_AGREEMENTS,
          description: 'Bank statement',
        }],
      })
      .expect(302)
      .expect('Location', route(RESPONSE_TASK_LIST_URL));
  });

  it('routes small-claim DQ availability decisions to the correct next page', async () => {
    setDraftClaim(buildRejectAllDisputeClaim());

    await request(app)
      .post(route(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect('Location', route(DQ_AVAILABILITY_DATES_FOR_HEARING_URL));

    await request(app)
      .post(route(DQ_AVAILABILITY_DATES_FOR_HEARING_URL))
      .send(buildFutureSingleUnavailableDate())
      .expect(302)
      .expect('Location', route(DQ_PHONE_OR_VIDEO_HEARING_URL));

    await request(app)
      .post(route(DQ_AVAILABILITY_DATES_FOR_HEARING_URL))
      .send(buildLongUnavailablePeriod())
      .expect(302)
      .expect('Location', route(DQ_UNAVAILABLE_FOR_HEARING_URL));
  });

  it('routes small-claim expert and self-evidence branches for individual and company defendants', async () => {
    setDraftClaim(buildRejectAllDisputeClaim());
    await request(app)
      .post(route(DQ_EXPERT_SMALL_CLAIMS_URL))
      .send({expertYes: YesNo.YES})
      .expect(302)
      .expect('Location', route(DQ_EXPERT_REPORT_DETAILS_URL));

    await request(app)
      .post(route(DQ_EXPERT_SMALL_CLAIMS_URL))
      .send({})
      .expect(302)
      .expect('Location', route(DQ_GIVE_EVIDENCE_YOURSELF_URL));

    const companyClaim = buildRejectAllDisputeClaim();
    companyClaim.respondent1.type = PartyType.COMPANY;
    setDraftClaim(companyClaim);
    await request(app)
      .post(route(DQ_GIVE_EVIDENCE_YOURSELF_URL))
      .send({option: YesNo.YES})
      .expect(302)
      .expect('Location', route(DQ_CONFIRM_YOUR_DETAILS_URL));
  });
});
