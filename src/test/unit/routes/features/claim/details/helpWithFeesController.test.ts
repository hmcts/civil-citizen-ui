import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_TOTAL_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {
  getClaimDetails,
  saveClaimDetails,
} from 'services/features/claim/details/claimDetailsService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

describe('Claim Details - Help With Fees', () => {
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
    it('should return Help With Fees page', async () => {
      mockGetClaimDetails.mockResolvedValue(new ClaimDetails());

      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.HELP_WITH_FEES.TITLE'));
        });

      expect(mockGetClaimDetails).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return status 500 when error thrown', async () => {
      mockGetClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to total page when NO selected', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });

      expect(mockSaveClaimDetails).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(HelpWithFees),
        'helpWithFees',
      );
    });

    it('should redirect to total page when YES selected', async () => {
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES, referenceNumber: 'test'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });

      expect(mockSaveClaimDetails).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(HelpWithFees),
        'helpWithFees',
      );
    });

    it('should show error if no radio button selected', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: ''})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CLAIM_HWF_REFERENCE_SELECTION_REQUIRED'));
        });

      expect(mockSaveClaimDetails).not.toHaveBeenCalled();
    });

    it('should show error if Yes selected and reference number is empty', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.HELP_WITH_FEES_REFERENCE_REQUIRED'));
        });

      expect(mockSaveClaimDetails).not.toHaveBeenCalled();
    });

    it('should return status 500 when error thrown', async () => {
      mockSaveClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
