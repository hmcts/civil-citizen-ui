import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {CLAIM_DETAILS} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockClaim as mockResponse} from '../../../../../utils/mockClaim';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {mockCivilClaim, mockCivilClaimUndefined, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {getTotalAmountWithInterestAndFees} from '../../../../../../main/modules/claimDetailsService';
import {dateFilter} from '../../../../../../main/modules/nunjucks/filters/dateFilter';
import {convertToPoundsFilter} from '../../../../../../main/common/utils/currencyFormat';

jest.mock('../../../../../../main/modules/oidc');

const nock = require('nock');

describe('Claim details page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return your claim details page with default values', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(400);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(TestMessages.CLAIM_NUMBER);
        });
    });
    test('should return your claim details page with values from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(mockResponse.legacyCaseReference);
          expect(res.text).toContain(getTotalAmountWithInterestAndFees(mockResponse));
          expect(res.text).toContain(mockResponse?.claimAmountBreakup[0].value.claimReason);
          expect(res.text).toContain(mockResponse?.claimAmountBreakup[0].value.claimAmount);
          expect(res.text).toContain(mockResponse?.totalInterest);
          expect(res.text).toContain(convertToPoundsFilter(mockResponse?.claimFee.calculatedAmountInPence));
          expect(res.text).toContain(mockResponse.detailsOfClaim);
          expect(res.text).toContain(mockResponse?.timelineOfEvents[0].value.timelineDescription);
          expect(res.text).toContain(dateFilter(mockResponse?.timelineOfEvents[0].value.timelineDate));
        });
      expect(spyRedisSave).toBeCalled();
    });
    test('should retrieve claim from redis when claim exists in redis', async () => {
      const mockGetClaimById = jest.fn().mockImplementation(() => {
        return {};
      });
      jest.mock('../../../../../../main/app/client/civilServiceClient', () => {
        return mockGetClaimById;
      });
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaim;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(getTotalAmountWithInterestAndFees(claim.case_data));
          expect(res.text).toContain(claim.case_data?.claimAmountBreakup[0].value.claimReason);
          expect(res.text).toContain(claim.case_data?.claimAmountBreakup[0].value.claimAmount);
          expect(res.text).toContain(claim.case_data?.totalInterest);
          expect(res.text).toContain(convertToPoundsFilter(claim.case_data?.claimFee.calculatedAmountInPence));
          expect(res.text).toContain(claim.case_data.detailsOfClaim);
          expect(res.text).toContain(claim.case_data?.timelineOfEvents[0].value.timelineDescription);
          expect(res.text).toContain(dateFilter(claim.case_data?.timelineOfEvents[0].value.timelineDate));
        });
      expect(spyRedisSave).not.toBeCalled();
      expect(mockGetClaimById).not.toBeCalled();
    });
    test('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
