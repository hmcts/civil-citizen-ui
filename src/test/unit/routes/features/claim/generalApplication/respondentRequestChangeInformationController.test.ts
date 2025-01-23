import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONDENT_INFORMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {decode} from 'punycode';
import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/utilityService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetClaim = utilityService.getClaimById as jest.Mock;

describe('General Application - Respondent Agree to order', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return page', async () => {

      await request(app)
        .get(GA_RESPONDENT_INFORMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          const decodedText = decode(res.text);
          expect(decodedText).toContain(t('PAGES.GENERAL_APPLICATION.RESPONDENT_INFORMATION.OTHER_PARTY_REQUEST'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {

      mockGetClaim.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONDENT_INFORMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
