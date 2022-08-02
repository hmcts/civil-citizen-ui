import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {CLAIM_DETAILS} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockRedisFailure,
  mockCivilClaimPDFTimeline,
} from '../../../../../utils/mockDraftStore';
import CivilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';
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
    it('should return your claim details page with default values', async () => {
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
    it('should return your claim details page with values from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, CivilClaimResponseMock);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain('000MC009'); // case number
          expect(res.text).toContain('£195.00'); // tottal claim amount
          expect(res.text).toContain('House repair'); // claim reason
          expect(res.text).toContain('200'); // claim amount
          expect(res.text).toContain('15'); // total interest
          expect(res.text).toContain('70'); // claim fee
          expect(res.text).toContain('House repair'); // details of claim
          expect(res.text).toContain('I noticed a leak on the landing and told Mr Smith about this.'); // timeline description
          expect(res.text).toContain('1 January 2022'); // timeline date
        });
      expect(spyRedisSave).toBeCalled();
    });
    it('should retrieve claim from redis when claim exists in redis', async () => {
      const mockGetClaimById = jest.fn().mockImplementation(() => {
        return {};
      });
      jest.mock('../../../../../../main/app/client/civilServiceClient', () => {
        return mockGetClaimById;
      });
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, CivilClaimResponseMock);
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
    it('should display Download and view their Timeline', async () => {
      const mockGetClaimById = jest.fn().mockImplementation(() => {
        return {};
      });
      jest.mock('../../../../../../main/app/client/civilServiceClient', () => {
        return mockGetClaimById;
      });
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, CivilClaimResponseMock);
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain('Download and view timeline');
        });
      expect(spyRedisSave).not.toBeCalled();
      expect(mockGetClaimById).not.toBeCalled();
    });
    it('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
