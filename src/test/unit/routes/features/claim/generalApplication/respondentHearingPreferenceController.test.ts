import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {GA_RESPONDENT_HEARING_PREFERENCE} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {Claim} from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isGaForLipsEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - Respondent Application hearing preference', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Respondent Application hearing preference page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_RESPONDENT_HEARING_PREFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.HEARING_PREFERENCE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONDENT_HEARING_PREFERENCE)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

