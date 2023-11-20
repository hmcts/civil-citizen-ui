import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claimant Timeline Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render timeline page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Timeline of events');
      });
    });

    it('should return 500 page on redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render timeline page if there are validation errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: []}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.AT_LEAST_ONE_ROW);
      });
    });

    it('should return 500 page if there are errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should update data and redirect to evidence page if all required details are provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
      });
    });

    it('should save data if applicant doesn\'t exist and redirect to evidence page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      const mockData = [{
        day: 1,
        month: 3,
        year: 2023,
        description: 'Raised an issue with Mr. Smith',
      }];
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: mockData}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_EVIDENCE_URL);
      });
    });
  });
});
