import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_TIMELINE_URL, CLAIM_REASON_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {
  getClaimDetails,
  saveClaimDetails,
} from 'services/features/claim/details/claimDetailsService';
import {Claim} from 'models/claim';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');

const mockClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

describe('Claim Details - Reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should return reason page empty when dont have information on redis ', async () => {
      mockClaimDetails.mockImplementation(async () => new Claim());
      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.REASON_EXPLANATION);
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockClaimDetails.mockImplementation(async () => {throw new Error(TestMessages.REDIS_FAILURE);});
      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.REASON_REQUIRED'));
        });
    });

    it('should accept a valid input', async () => {
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to timeline page', async () => {
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TIMELINE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveClaimDetails.mockImplementation(async () => {throw new Error(TestMessages.REDIS_FAILURE);});
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
