import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  GA_HEARING_SUPPORT_URL,
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - Unavailable hearing dates confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.GA_UNAVAILABLE_DATES_CONFIRMATION.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to unavailable dates if user selects yes', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);

      await request(app)
        .post(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .type('form').send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_UNAVAILABLE_HEARING_DATES_URL);
        });
    });

    it('should redirect to hearing support if user selects no', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);

      await request(app)
        .post(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .type('form').send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(GA_HEARING_SUPPORT_URL);
        });
    });

    it('should validate', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);

      await request(app)
        .post(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ERROR_UNAVAILABLE_DATE_CONFIRMATION'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_UNAVAILABILITY_CONFIRMATION_URL)
        .type('form').send()
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
