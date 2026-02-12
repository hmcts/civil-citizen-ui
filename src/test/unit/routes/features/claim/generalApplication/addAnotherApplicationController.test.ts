import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { GA_ADD_ANOTHER_APPLICATION_URL } from 'routes/urls';
import { app } from '../../../../../../main/app';
import * as draftService from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import { t } from 'i18next';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - add another application', () => {
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
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM)];
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_ADD_ANOTHER_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.ADD_ANOTHER_APPLICATION.DO_YOU_ADD_ANOTHER_APPLICATION'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.ADD_ANOTHER_APPLICATION.ADDITIONAL_FEE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {

      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_ADD_ANOTHER_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should save the value and redirect', async () => {
      await request(app)
        .post(GA_ADD_ANOTHER_APPLICATION_URL)
        .type('form').send({ option: 'yes' })
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(GA_ADD_ANOTHER_APPLICATION_URL)
        .type('form').send({ option: null })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.WANT_TO_ADD_ANOTHER_APPLICATION'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockDataFromStore.mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .post(GA_ADD_ANOTHER_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
