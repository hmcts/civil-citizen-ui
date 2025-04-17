import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  APPLICATION_TYPE_URL,
  QUERY_MANAGEMENT_CREATE_QUERY, QM_FOLLOW_UP_URL, QM_START_URL, QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {getQueryManagement, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/features/queryManagement/queryManagementService');

const CONTROLLER_URL = QM_START_URL;
describe('Query management start Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = getQueryManagement as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      return claim;
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('on GET', () => {
    it('should return query management start page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return query management start page and remove the old QM information', async () => {
      await request(app)
        .get(`${CONTROLLER_URL}?linkFrom=start`)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should Valid page', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.QUERY_MANAGEMENT_YOU_MUST_SELECT);
        });
    });

    it('should redirect page when CHANGE_CASE', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.CHANGE_CASE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(APPLICATION_TYPE_URL);
        });
    });

    it('should redirect page when GET_SUPPORT', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.GET_SUPPORT})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(QUERY_MANAGEMENT_CREATE_QUERY);
        });
    });

    it('should redirect page when FOLLOW_UP', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.FOLLOW_UP})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(QM_FOLLOW_UP_URL);
        });
    });

    it('should redirect page when SOMETHING_ELSE', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.SOMETHING_ELSE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(QUERY_MANAGEMENT_CREATE_QUERY);
        });
    });

    it('should redirect page when MANAGE_HEARING', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.MANAGE_HEARING})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(QM_WHAT_DO_YOU_WANT_TO_DO_URL.replace(':qmType', WhatToDoTypeOption.MANAGE_HEARING));
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = saveQueryManagement as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.CHANGE_CASE})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
