import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {GA_PAYMENT_UNSUCCESSFUL_URL} from 'routes/urls';
import {Claim} from 'common/models/claim';
import {isGaForLipsEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import * as draftService from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  getApplicationFromGAService: jest.fn(),
}));
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Claim fee unsuccessful payment confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  let claim: Claim;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.generalApplication = new GeneralApplication();
  });

  describe('on GET', () => {
    it('should return unsuccessful payment page', async () => {
      claim.generalApplication.applicationTypes.push(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
      mockDataFromStore.mockResolvedValueOnce(claim);
      await request(app)
        .get(GA_PAYMENT_UNSUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unsuccessful payment');
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAYMENT_UNSUCCESSFUL.YOUR_PAYMENT_HAS_FAILED'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAYMENT_UNSUCCESSFUL.CONTACT_YOUR_BANK'));
        });

    });
  });
});
