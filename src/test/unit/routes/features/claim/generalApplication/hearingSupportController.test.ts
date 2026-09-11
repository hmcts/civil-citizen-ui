import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_HEARING_SUPPORT_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {civilClaimResponseMock, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {SupportType} from 'models/generalApplication/hearingSupport';
import { isGaForLipsEnabled } from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const civilClaimWithGeneralApplication = {
  ...civilClaimResponseMock,
  case_data: {
    ...civilClaimResponseMock.case_data,
    generalApplication: new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)),
  },
};

const mockCivilClaimWithGeneralApplication = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimWithGeneralApplication))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve(-1)),
  expireat: jest.fn(() => Promise.resolve({})),
};

describe('General Application - Hearing support', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithGeneralApplication;

      await request(app)
        .get(GA_HEARING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(GA_HEARING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithGeneralApplication;
      await request(app)
        .post(GA_HEARING_SUPPORT_URL)
        .send({requiredSupport: [SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
          signLanguageContent: 'test1', languageContent: 'test2', otherContent: 'test3'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on box selected but no input', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithGeneralApplication;
      await request(app)
        .post(GA_HEARING_SUPPORT_URL)
        .send({requiredSupport: SupportType.OTHER_SUPPORT, signLanguageContent: '', languageContent: '', otherContent: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.MISSING_OTHER'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(GA_HEARING_SUPPORT_URL)
        .send({requiredSupport: [SupportType.STEP_FREE_ACCESS, SupportType.HEARING_LOOP]})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
