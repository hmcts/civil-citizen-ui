import request from 'supertest';
import {app} from '../../../../../main/app';
import {QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import {Claim} from 'models/claim';
import {deleteQueryManagement, getQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import * as queryManagementService from 'services/features/queryManagement/queryManagementService';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {LinKFromValues} from 'models/generalApplication/applicationType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/queryManagement/queryManagementService');

const queryManagementMock = getQueryManagement as jest.Mock;

describe('Send follow query controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {

    it('should render query page', async () => {
      queryManagementMock.mockResolvedValue(new Claim());
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
      queryManagementMock.mockResolvedValue(new QueryManagement());
      const removeDocSpy = jest.spyOn(queryManagementService, 'removeSelectedDocument');
      await request(app)
        .get(QM_FOLLOW_UP_MESSAGE + '?id=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(removeDocSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('should remove Field values url starts with start', async () => {
      const preFilledData = {'messageDetails': 'test body'};
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.sendFollowUpQuery = preFilledData as SendFollowUpQuery;
      queryManagementMock.mockResolvedValue(claim.queryManagement);

      await request(app)
        .get(QM_FOLLOW_UP_MESSAGE + `?linkFrom=${LinKFromValues.start}`)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(deleteQueryManagement).toHaveBeenCalledTimes(1);
        });
    });
  });

  describe('POST', () => {

    it('should redirect on successful form', async () => {
      queryManagementMock.mockResolvedValue(new QueryManagement());
      const saveQueryManagement = jest.spyOn(queryManagementService, 'saveQueryManagement');
      const data = {'messageDetails': 'test body'};
      const res = await request(app).post(QM_FOLLOW_UP_MESSAGE).send(data);
      expect(res.status).toBe(302);
      expect(saveQueryManagement).toHaveBeenCalled();
    });

    it('should redirect on successful form when exists a follow up', async () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
      queryManagementMock.mockResolvedValue(claim.queryManagement);
      const saveQueryManagement = jest.spyOn(queryManagementService, 'saveQueryManagement');
      const data = {'messageDetails': 'test body'};
      const res = await request(app).post(QM_FOLLOW_UP_MESSAGE).send(data);
      expect(res.status).toBe(302);
      expect(saveQueryManagement).toHaveBeenCalled();
    });

    it('should render the page with errors for the missing fields', async () => {
      queryManagementMock.mockResolvedValue(new QueryManagement());
      const res = await request(app).post(QM_FOLLOW_UP_MESSAGE).send({});
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain('Enter message details');
    });

    it('should trigger redirect on successful file upload', async () => {
      queryManagementMock.mockResolvedValue(new QueryManagement());
      const uploadSelectedFile = jest.spyOn(queryManagementService, 'uploadSelectedFile');
      await request(app).post(QM_FOLLOW_UP_MESSAGE).send({action: 'uploadButton'})
        .expect(res => {
          expect(res.status).toBe(302);
          expect(uploadSelectedFile).toHaveBeenCalled();
        });
    });
  });
});
