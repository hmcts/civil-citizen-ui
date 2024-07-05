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
import {Claim} from 'models/claim';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');

const mockClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

describe('Claim Details - Help With Fees', () => {
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
    it('should return Help With Fees page', async () => {
      mockClaimDetails.mockImplementationOnce(async () => {
        return new Claim();
      });
      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.HELP_WITH_FEES.TITLE'));
        });
    });
    it('should return status 500 when error thrown', async () => {
      mockClaimDetails.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      mockClaimDetails.mockImplementationOnce(async () => {
        return new Claim();
      });
      mockSaveClaimDetails.mockImplementation(async () => Promise<void>);
    });

    it('should redirect to total page when NO selected', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });
    });

    it('should redirect to total page when YES selected', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES, referenceNumber: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });
    });

    it('should show error if no radio button selected', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });

    it('should show error if Yes selected and reference number is empty', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.HELP_WITH_FEES_REFERENCE_REQUIRED'));
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockSaveClaimDetails.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
