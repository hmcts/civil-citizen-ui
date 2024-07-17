import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {DQ_SENT_EXPERT_REPORTS_URL, DQ_SHARE_AN_EXPERT_URL} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Sent Expert Reports Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return sent expert reports page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_SENT_EXPERT_REPORTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you already sent expert reports to other parties?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_SENT_EXPERT_REPORTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should return sent expert reports page on empty post', async () => {
      await request(app).post(DQ_SENT_EXPERT_REPORTS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_SENT_EXPERT_REPORTS);
      });
    });

    it('should redirect to the share the expert to claimant page if option yes is selected', async () => {
      await request(app).post(DQ_SENT_EXPERT_REPORTS_URL).send({sentExpertReportsOptions: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_SHARE_AN_EXPERT_URL);
        });
    });

    it('should redirect to the share the expert to claimant page if option no is selected', async () => {
      await request(app).post(DQ_SENT_EXPERT_REPORTS_URL).send({sentExpertReportsOptions: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_SHARE_AN_EXPERT_URL);
        });
    });

    it('should redirect to the share the expert to claimant page if option no, not received is selected', async () => {
      await request(app).post(DQ_SENT_EXPERT_REPORTS_URL).send({sentExpertReportsOptions: 'not-received'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_SHARE_AN_EXPERT_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_SENT_EXPERT_REPORTS_URL)
        .send({sentExpertReportsOptions: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
