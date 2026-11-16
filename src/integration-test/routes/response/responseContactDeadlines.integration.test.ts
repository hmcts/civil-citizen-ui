import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {DOB_URL, REQUEST_MORE_TIME_URL, UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';

const CLAIM_ID = '000MC6282';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.DEFENDANT;
  claim.totalClaimAmount = 1000;
  claim.respondent1ResponseDeadline = new Date('2099-06-01T16:00:00.000Z');
  return claim;
};

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = {
    set: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve(JSON.stringify({id: claim.id, case_data: claim}))),
    del: jest.fn(() => Promise.resolve({})),
    ttl: jest.fn(() => Promise.resolve(-1)),
    expireat: jest.fn(() => Promise.resolve({})),
  };
};

describe('Integration: response contact details and deadlines', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    setDraftClaim(buildClaim());
  });

  it('shows the requesting extra time page', async () => {
    const response = await request(app).get(route(UNDERSTANDING_RESPONSE_OPTIONS_URL));

    expect(response.status).toBe(200);
    expect(response.text).toContain('Requesting extra time');
  });

  it('shows a validation error when the date of birth is left blank', async () => {
    const response = await request(app).post(route(DOB_URL)).send({day: '', month: '', year: ''});

    expect(response.status).toBe(200);
    expect(response.text).toContain('Enter your date of birth');
    expect(response.text).toContain('Enter a valid day');
  });

  it('redirects to the task list when more time of up to 28 days is requested', async () => {
    const response = await request(app).post(route(REQUEST_MORE_TIME_URL)).send({option: 'up-to-28-days'});

    expect(response.status).toBe(302);
    expect(response.header.location).toContain('/response/task-list');
  });
});
