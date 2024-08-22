import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';
import {CaseState} from 'form/models/claimDetails';
import * as utilService from 'modules/utilityService';
import {Claim} from 'models/claim';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Claimant Response - Settle Part Admit Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  jest.mock('modules/utilityService', () => ({
    getRedisStoreForSession: jest.fn(),
  }));

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      jest.spyOn(claim, 'isClaimantIntentionPending').mockReturnValue(true);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      await request(app).get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .get(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {

    it('should return error on empty post', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_NO_SELECTION);
      });
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response reject reason page if option no is selected', async () => {
      jest.clearAllMocks();
      jest.spyOn(utilService, 'getClaimById').mockResolvedValue(claim);
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .post(CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
