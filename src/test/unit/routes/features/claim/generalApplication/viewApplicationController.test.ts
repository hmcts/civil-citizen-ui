import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GeneralApplicationClient} from 'client/generalApplicationClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import mockApplication from '../../../../../utils/mocks/applicationMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/generalApplication/viewApplication/viewApplicationService');
jest.mock('../../../../../../main/app/client/generalApplicationClient');

const mockedSummaryRows = getApplicationSections as jest.Mock;

describe('General Application - View application', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const application = Object.assign(new ApplicationResponse(), mockApplication);
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(GeneralApplicationClient.prototype, 'getApplication').mockResolvedValueOnce(application);
    jest.spyOn(launchDarkly, 'isDashboardServiceEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Check your answers page', async () => {
      mockedSummaryRows.mockImplementation(() => []);
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .query({applicationId: '1718105701451856'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.ORDER_JUDGE.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockedSummaryRows.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_VIEW_APPLICATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

