import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Using an expert', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return Using and expert page', async () => {
      await request(app)
        .get(DQ_EXPERT_SMALL_CLAIMS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.TITLE'));
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
    });

    it('should redirect to give evidence yourself if continue without expert is selected', async () => {
      await request(app).post(DQ_EXPERT_SMALL_CLAIMS_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.get('location')).toBe(DQ_GIVE_EVIDENCE_YOURSELF_URL);
      });
    });

    it('should redirect to expert report details page if expert required selecrted selected', async () => {
      await request(app).post(DQ_EXPERT_SMALL_CLAIMS_URL)
        .send({expertYes: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_REPORT_DETAILS_URL);
        });
    });
    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_EXPERT_SMALL_CLAIMS_URL)
        .send({expertYes: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
