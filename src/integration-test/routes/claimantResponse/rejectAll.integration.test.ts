import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {app} from '../../../main/app';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../main/routes/urls';
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
import {YesNo} from '../../../main/common/form/models/yesNo';
import {CaseState} from '../../../main/common/form/models/claimDetails';

const CLAIM_ID = '000MC456';
const SUBMITTED_DATE = '2026-02-03T09:00:00.000Z';

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
  claim.applicant1 = createClaimWithBasicApplicantDetails().applicant1;
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  return claim;
};

const buildDisputeClaim = (intentionToProceed: YesNo) => {
  const claim = withCommonClaimMetadata(createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE));
  claim.totalClaimAmount = 9000;
  claim.claimantResponse = {
    intentionToProceed: new GenericYesNo(intentionToProceed),
  };
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
  claim.claimantResponse = {
    hasFullDefenceStatesPaidClaimSettled: new GenericYesNo(settled),
  };
  claim.mediation = {
    canWeUse: {
      option: YesNo.YES,
      mediationPhoneNumber: '07111111111',
    },
    companyTelephoneNumber: {},
  };
  return claim;
};

describe('Integration: claimant reject-all branching', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  it('renders the dispute-all non-CARM task list when the claimant proceeds', async () => {
    setDraftClaim(buildDisputeClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How they responded');
        expect(res.text).toContain('Choose what to do next');
        expect(res.text).toContain('Decide whether to proceed');
        expect(res.text).toContain('Free telephone mediation');
        expect(res.text).toContain('Give us details in case there&#39;s a hearing');
        expect(res.text).not.toContain('Telephone mediation');
        expect(res.text).not.toContain('Availability for mediation');
      });
  });

  it('renders the dispute-all CARM task list when the claimant proceeds', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    setDraftClaim(buildDisputeClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Decide whether to proceed');
        expect(res.text).toContain('Free telephone mediation');
        expect(res.text).toContain('Mediation');
        expect(res.text).toContain('Telephone mediation');
        expect(res.text).toContain('Availability for mediation');
        expect(res.text).toContain('Give us details in case there&#39;s a hearing');
      });
  });

  it('removes mediation and hearing tasks when the claimant does not proceed after a dispute-all response', async () => {
    setDraftClaim(buildDisputeClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Decide whether to proceed');
        expect(res.text).not.toContain('Free telephone mediation');
        expect(res.text).not.toContain('Telephone mediation');
        expect(res.text).not.toContain('Availability for mediation');
        expect(res.text).not.toContain('Give us details in case there\'s a hearing');
      });
  });

  it('shows the settled already-paid outcome without extra task-list branches', async () => {
    setDraftClaim(buildAlreadyPaidInFullClaim(YesNo.YES));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Accept or reject their response');
        expect(res.text).not.toContain('Free telephone mediation');
        expect(res.text).not.toContain('Telephone mediation');
        expect(res.text).not.toContain('Availability for mediation');
      });
  });

  it('shows the rejected already-paid outcome with a follow-on mediation task', async () => {
    setDraftClaim(buildAlreadyPaidInFullClaim(YesNo.NO));

    await request(app)
      .get(route(CLAIMANT_RESPONSE_TASK_LIST_URL))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Accept or reject their response');
        expect(res.text).toContain('Free telephone mediation');
        expect(res.text).not.toContain('Telephone mediation');
        expect(res.text).not.toContain('Availability for mediation');
      });
  });
});
