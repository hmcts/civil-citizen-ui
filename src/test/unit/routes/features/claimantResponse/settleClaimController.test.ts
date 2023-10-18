import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL ,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as utilService from 'modules/utilityService';
import { Claim } from 'common/models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Claimant Response - Settle Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();
  beforeEach(() => {
    jest.spyOn(utilService, 'getClaimById').mockResolvedValue({ isClaimantIntentionPending: () => true } as Claim);
  });
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      jest.spyOn(claim, 'isPartialAdmissionPaid').mockReturnValue(true);
      jest.spyOn(claim, 'partialAdmissionPaidAmount').mockReturnValue(20);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      await request(app).get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the £20 the defendant has paid?');
      });
    });

    it('should return settle claim page when defendant paid full amount', async () => {
      jest.spyOn(claim, 'isFullDefence').mockReturnValueOnce(true);
      jest.spyOn(claim, 'hasPaidInFull').mockReturnValueOnce(true);
      jest.spyOn(claim, 'isRejectAllOfClaimAlreadyPaid').mockReturnValueOnce(110);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      await request(app).get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you agree the defendant has paid the £110 in full?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Please select yes or no');
      });
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response reject reason page if option no is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_REJECTION_REASON_URL );
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      jest.spyOn(utilService, 'getClaimById').mockRejectedValueOnce(mockRedisFailure);
      await request(app)
        .post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
