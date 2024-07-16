import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  DQ_EXPERT_CAN_STILL_EXAMINE_URL,
  DQ_EXPERT_DETAILS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Defendant expert can still examine Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return expert can still examine page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_EXPERT_CAN_STILL_EXAMINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the claim involve something an expert can still examine?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_EXPERT_CAN_STILL_EXAMINE_URL)
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

    it('should return expert can still examine page', async () => {
      await request(app).post(DQ_EXPERT_CAN_STILL_EXAMINE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Does the claim involve something an expert can still examine?');
      });
    });

    it('should redirect to the defendant expert reports page if option yes is selected and reason is provided', async () => {
      await request(app).post(DQ_EXPERT_CAN_STILL_EXAMINE_URL)
        .send({option: 'yes', details: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_DETAILS_URL);
        });
    });

    it('should redirect to yourself evidence page if option no is selected', async () => {
      await request(app).post(DQ_EXPERT_CAN_STILL_EXAMINE_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_GIVE_EVIDENCE_YOURSELF_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_EXPERT_CAN_STILL_EXAMINE_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
