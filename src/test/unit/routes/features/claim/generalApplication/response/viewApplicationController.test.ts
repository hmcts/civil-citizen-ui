import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONSE_VIEW_APPLICATION_URL} from 'routes/urls';
import {t} from 'i18next';
import {GaServiceClient} from 'client/gaServiceClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../../utils/mocks/applicationMock.json';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {app} from '../../../../../../../main/app';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../../main/app/client/gaServiceClient');

const mockedSummaryRows = getApplicationSections as jest.Mock;

describe('General Application - View application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const application = Object.assign(new ApplicationResponse(), mockApplication);
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(GaServiceClient.prototype, 'getApplication').mockResolvedValueOnce(application);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Application view page', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123','1718105701451856',GA_RESPONSE_VIEW_APPLICATION_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockedSummaryRows.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_RESPONSE_VIEW_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

