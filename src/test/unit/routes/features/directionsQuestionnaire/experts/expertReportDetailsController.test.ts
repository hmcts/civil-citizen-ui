import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_EXPERT_GUIDANCE_URL,
  DQ_EXPERT_REPORT_DETAILS_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import civilClaimResponseDefendantMock from '../../../../../utils/mocks/civilClaimResponseDefendantMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Expert Report Details Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Have you already got a report written by an expert', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_EXPERT_REPORT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you already got a report written by an expert?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_EXPERT_REPORT_DETAILS_URL)
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

    it('should return page with error message on empty post', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to expert details if option yes is selected - claimant', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should redirect to give evidence yourself if option yes is selected - defendant', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseDefendantMock.case_data);
      });
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes', reportDetails: [{expertName: 'Ahmet', day: '1', month: '3', year: '2022'}]})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_GIVE_EVIDENCE_YOURSELF_URL);
        });
    });

    it('should redirect to expert guidance page if option no is selected', async () => {
      await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_GUIDANCE_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({option: 'yes', reportDetails: [{expertName: 'Ahmet', day: '1', month: '3', year: '2022'}]})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
