import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { app } from '../../../../../../main/app';
import { GA_APPLICATION_SUMMARY_URL } from 'routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { t } from 'i18next';
import { Claim } from 'models/claim';
import { isGaForLipsEnabled } from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { GeneralApplicationClient } from 'client/generalApplicationClient';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { decode } from 'punycode';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('General Application - Application costs', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    const applicationMock = {
      id: '1234567890',
      case_data: {
        applicationTypes: 'Adjourn a hearing', 
      },
      state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
      last_modified: '2024-05-29T14:39:28.483971',
      created_date: '2024-05-29T14:39:28.483971',
    };

    it('should return page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      jest
        .spyOn(GeneralApplicationClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValueOnce([applicationMock]);

      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.TITLE'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION') + ' 1');
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.DETAILS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.STATUS'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.AWAITING_RESPONDENT_RESPONSE'));
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.IN_PROGRESS'));
          expect(decode(res.text)).toContain(applicationMock.case_data.applicationTypes);
          expect(decode(res.text)).toContain(applicationMock.id);
          expect(decode(res.text)).toContain('29 May 2024, 2:39:28 pm');
          expect(decode(res.text)).toContain(t('PAGES.GENERAL_APPLICATION.SUMMARY.VIEW_APPLICATION'));
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLICATION_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
