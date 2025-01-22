import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import { gaApplicationFeeDetails } from 'services/features/generalApplication/feeDetailsService';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/services/features/generalApplication/feeDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGaApplicationFeeDetails = gaApplicationFeeDetails as jest.Mock;

describe('General Application - Application type', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
    mockGaApplicationFeeDetails.mockResolvedValueOnce({calculatedAmountInPence: 123});
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(PAYING_FOR_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAYMENT_FOR_APPLICATION.TITLE'));
        });
    });

    it('should display proper amount', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      mockGaApplicationFeeDetails.mockResolvedValueOnce({calculatedAmountInPence: 123});

      await request(app)
        .get(PAYING_FOR_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('<p class="govuk-body">£1.23</p>');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(PAYING_FOR_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
