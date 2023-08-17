import {app} from '../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {t} from 'i18next';
import {
  mockCivilClaim,
} from '../../../../utils/mockDraftStore';
import nock from 'nock';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/draft-store/draftStoreService');

const {isCUIReleaseTwoEnabled} = require('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockIsCUIReleaseTwoEnabled = isCUIReleaseTwoEnabled as jest.Mock;

describe('Claim TaskList page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return claim tasklist page', async () => {
      const mockClaim = new Claim();
      mockClaim.id = '1';
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockIsCUIReleaseTwoEnabled.mockImplementation(async () => false);

      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });
    });

    it('should create and return new Claim when not Release 2', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      app.request.cookies = {eligibilityCompleted: true};

      mockGetCaseData.mockImplementation(async () => undefined);
      mockIsCUIReleaseTwoEnabled.mockImplementation(async () => true);
      const saveDraftClaimSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await request(app)
        .get(CLAIMANT_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
        });

      expect(saveDraftClaimSpy).toBeCalled();
    });
  });
});
