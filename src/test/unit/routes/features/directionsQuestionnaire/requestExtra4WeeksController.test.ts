import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL, SUBJECT_TO_FRC_URL,
} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const isMintiEnabledForCase = launchDarklyClient.isMintiEnabledForCase as jest.Mock;

describe('Request extra 4 weeks to Settle Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return request extra 4 weeks to settle the claim page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).get(DQ_REQUEST_EXTRA_4WEEKS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want an extra 4 weeks to try to settle the claim?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_REQUEST_EXTRA_4WEEKS_URL)
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

    it('should return request extra 4 weeks to settle the claim page on empty post', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_REQUEST_EXTRA_4_WEEKS);
      });
    });

    it('should redirect to consider claimant documents page if option yes is selected', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should redirect to consider claimant documents page page if option no is selected', async () => {
      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should redirect to consider claimant docs page if option no is selected and minti is enabled and is not intermediate or multi track', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const draftClaim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
        draftClaim.totalClaimAmount = 10000;
        return draftClaim;
      });
      jest.spyOn(launchDarkly, 'isMintiEnabled').mockResolvedValueOnce(true);
      isMintiEnabledForCase.mockResolvedValue(false);

      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should redirect to consider claimant docs page if option no is selected and minti is not enabled and is higher than fast track amount', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const draftClaim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
        draftClaim.totalClaimAmount = 26000;
        return draftClaim;
      });
      isMintiEnabledForCase.mockResolvedValue(false);

      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL);
        });
    });

    it('should redirect to fixed recoverable costs page if option no is selected and minti is enabled and is intermediate track', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const draftClaim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
        draftClaim.totalClaimAmount = 26000;
        return draftClaim;
      });
      isMintiEnabledForCase.mockResolvedValue(true);

      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(SUBJECT_TO_FRC_URL);
        });
    });

    it('should redirect to disclosure of documents page if option no is selected and minti is enabled and is multi track', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const draftClaim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
        draftClaim.totalClaimAmount = 150000;
        return draftClaim;
      });
      isMintiEnabledForCase.mockResolvedValue(true);

      await request(app).post(DQ_REQUEST_EXTRA_4WEEKS_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_DISCLOSURE_OF_DOCUMENTS_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_REQUEST_EXTRA_4WEEKS_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
