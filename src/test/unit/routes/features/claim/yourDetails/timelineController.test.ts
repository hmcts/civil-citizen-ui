import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import civilClaimResponseOptionNoMock from '../../../../../utils/mocks/civilClaimResponseOptionNoMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

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
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Timeline of events');
      });
    });

    it('should return 500 page on redis failure', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render timeline page if there are validation errors', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      await request(app).post(CLAIM_TIMELINE_URL).send({rows: []}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.AT_LEAST_ONE_ROW);
      });
    });

    it('should return 500 page if there are errors', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(CLAIM_TIMELINE_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    it('should update data and redirect to evidence page if all required details are provided', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
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
      mockGetCaseData.mockImplementation(async () => {
        const jsonObject = JSON.parse(JSON.stringify(civilClaimResponseOptionNoMock));
        return jsonObject as Claim;
      });

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
