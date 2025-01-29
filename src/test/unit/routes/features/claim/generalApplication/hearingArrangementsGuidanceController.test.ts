import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_HEARING_ARRANGEMENTS_GUIDANCE_URL, GA_WANT_TO_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
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
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - application hearing arrangements', () => {
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
    it('should return  application hearing arrangements page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockClaim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT)];
      await request(app)
        .get(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS_GUIDANCE.TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT'));
        });
    });

    it('should return "Make an application" title', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockClaim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT),
        new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)];
      await request(app)
        .get(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS_GUIDANCE.TITLE'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.COMMON.MAKE_AN_APPLICATION'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_WANT_TO_UPLOAD_DOCUMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

