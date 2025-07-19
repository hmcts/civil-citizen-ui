import {app} from '../../../../../../main/app';
import request from 'supertest';
import {GA_SUBMIT_OFFLINE} from 'routes/urls';
import {t} from 'i18next';
import config from 'config';
import nock from 'nock';
import {isQueryManagementEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';

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

describe('General Application - Application costs', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    mockGetClaim.mockImplementation(() => {
      return new Claim();
    });
  });

  describe('on GET', () => {
    it('should return page with QM LIP off', async () => {
      await request(app)
        .get(GA_SUBMIT_OFFLINE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.TITLE'));
          expect(res.text).toContain(t('N244 form'));
        });
    });
    it('should return page with QM LIP on', async () => {
      (isQueryManagementEnabled as jest.Mock).mockReturnValueOnce(true);
      await request(app)
        .get(GA_SUBMIT_OFFLINE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.TITLE'));
          expect(res.text).toContain(t('N244 form'));
        });
    });
  });
});
