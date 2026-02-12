import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_HEARING_CONTACT_DETAILS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = saveDraftClaim as jest.Mock;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - Contact Details', () => {
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
    it('should return Contact Details page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_HEARING_CONTACT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_CONTACT_DETAILS.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_HEARING_CONTACT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_HEARING_CONTACT_DETAILS_URL)
        .type('form').send({telephoneNumber: '04432188664', emailAddress: 'test@gmail.com'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should show error message if no value entered', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_HEARING_CONTACT_DETAILS_URL)
        .type('form').send({telephoneNumber: null, emailAddress: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_TELEPHONE_NUMBER'));
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.ENTER_VALID_EMAIL'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_HEARING_CONTACT_DETAILS_URL)
        .type('form').send({telephoneNumber: '04432188664', emailAddress: 'test@gmail.com' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

