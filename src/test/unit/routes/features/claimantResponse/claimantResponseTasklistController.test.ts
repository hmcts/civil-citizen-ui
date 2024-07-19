import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {app} from '../../../../../main/app';
import {CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {configureSpy} from '../../../../utils/spyConfiguration';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import civilClaimResponseClaimantIntentMock from '../../../../utils/mocks/civilClaimResponseClaimantIntentionMock.json';
import {Claim} from 'models/claim';
import civilClaimResponseClaimantIntentionMockNotSettle
  from '../../../../utils/mocks/civilClaimResponseClaimantIntentionMockNotSettle.json';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(launchDarklyClient, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

describe('Claimant response task list', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should display task list', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseClaimantIntentMock.case_data);
      });
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).toContain('Submit');

        });
    });

    it('should display task list carm not enabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseClaimantIntentMock.case_data);
      });
      isCarmEnabledSpy(false);
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).not.toContain('Mediation');
          expect(res.text).toContain('Submit');

        });
    });

    it('should display task list claimant proceeds carm enabled', async () => {
      isCarmEnabledSpy(true);
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseClaimantIntentionMockNotSettle.case_data);
      });
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your response');
          expect(res.text).toContain('How they responded');
          expect(res.text).toContain('Mediation');
          expect(res.text).toContain('Submit');

        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIMANT_RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
