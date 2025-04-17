import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as sendFollowService from 'services/features/queryManagement/sendFollowUpQueryService';
import * as QueryManagementService from 'services/features/queryManagement/queryManagementService';
import * as utilityService from 'modules/utilityService';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('../../../../../main/modules/utilityService');
jest.mock('services/features/queryManagement/sendFollowUpQueryService');

const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('Send follow query controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should render query page', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      await request(app)
        .get(QM_FOLLOW_UP_MESSAGE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send a follow up message');
          expect(res.text).toContain('Enter message details');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('Include as many details as possible so case workers can respond to your message');
          expect(res.text).toContain('Upload documents (optional)');
        });
    });

    it('should call through to removeSelectedDocument when the query param is passed', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const removeDocSpy = jest.spyOn(sendFollowService, 'removeSelectedDocument');
      await request(app)
        .get(QM_FOLLOW_UP_MESSAGE + '?id=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(removeDocSpy).toHaveBeenCalled();
        });
    });

    it('should pre fill field values when session data is set', async () => {
      const preFilledData = {'messageDetails': 'test body'};
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.queryManagement = new QueryManagement();
        claim.queryManagement.sendFollowUpQuery = preFilledData as SendFollowUpQuery;
        return claim;
      });

      await request(app)
        .get(QM_FOLLOW_UP_MESSAGE + '?id=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('test body');
        });
    });
  });

  describe('POST', () => {

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect on successful form', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const saveQueryManagement = jest.spyOn(QueryManagementService, 'saveQueryManagement');
      const data = {'messageDetails': 'test body'};
      const res = await request(app).post(QM_FOLLOW_UP_MESSAGE).send(data);
      expect(res.status).toBe(302);
      expect(saveQueryManagement).toHaveBeenCalled();
    });

    it('should render the page with errors for the missing fields', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const res = await request(app).post(QM_FOLLOW_UP_MESSAGE).send({});
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain('Enter message details');
    });

    it('should trigger redirect on successful file upload', async () => {
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      jest.spyOn(QueryManagementService, 'uploadSelectedFile');
      await request(app).post(QM_FOLLOW_UP_MESSAGE).send({action: 'uploadButton'})
        .expect(res => {
          expect(res.status).toBe(302);
        });
    });
  });
});
