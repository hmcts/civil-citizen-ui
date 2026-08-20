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
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

describe('Claim Details - Reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return reason page empty when dont have information on redis ', async () => {
      mockGetClaimDetails.mockResolvedValue(new ClaimDetails());

      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.REASON_EXPLANATION);
        });

      expect(mockGetClaimDetails).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });

      expect(mockSaveClaimDetails).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Reason),
        'reason',
      );
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: ''})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.REASON_REQUIRED').replace(/'/g, '&#39;'));
        });

      expect(mockSaveClaimDetails).not.toHaveBeenCalled();
    });

    it('should accept a valid input', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to timeline page', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TIMELINE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
