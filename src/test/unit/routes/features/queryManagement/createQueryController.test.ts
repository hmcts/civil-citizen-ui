import request from 'supertest';
import {app} from '../../../../../main/app';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as QueryManagementService from 'services/features/queryManagement/queryManagementService';
import {Session} from 'express-session';
import {GenericForm} from 'form/models/genericForm';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('modules/utilityService');

describe('create query conroller', () => {
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
      await request(app)
        .get(QUERY_MANAGEMENT_CREATE_QUERY)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send a message');
          expect(res.text).toContain('Enter message details');
          expect(res.text).toContain('Message subject');
          expect(res.text).toContain('The subject should be a summary of your message');
          expect(res.text).toContain('Message details');
          expect(res.text).toContain('Include as many details as possible so case workers can respond to your message');
          expect(res.text).toContain('Is your message about a hearing?');
          expect(res.text).toContain('Upload documents (optional)');
        });
    });

    it('should call through to removeSelectedDocument when the query param is passed', async () => {
      const removeDocSpy = jest.spyOn(QueryManagementService, 'removeSelectedDocument');
      await request(app)
        .get(QUERY_MANAGEMENT_CREATE_QUERY + '?id=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(removeDocSpy).toHaveBeenCalled();
        });
    });

    it('should prefil field values when session data is set', async () => {
      const prefilledData = {'messageSubject': 'test sub', 'messageDetails': 'test body', 'isHearingRelated': 'yes'};
      app.request.session = { fileUpload:JSON.stringify(prefilledData) } as unknown as Session;

      await request(app)
        .get(QUERY_MANAGEMENT_CREATE_QUERY + '?id=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('test sub');
          expect(res.text).toContain('test body');
          expect(res.text).toContain('yes');
        });
    });
  });

  describe('POST', ()=> {
    const qmServiceMock = jest.spyOn(QueryManagementService, 'uploadSelectedFile');
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should redirect on successful form', async () => {
      const data = {'query-subject-field': 'test sub', 'query-message-field': 'test body', 'is-query-hearing-related': 'yes'};
      const res = await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send(data);
      expect(res.status).toBe(302);
    });

    it('should render the page with errors for the missing fields', async () => {
      const res = await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({});
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(res.text).toContain('Enter message subject');
      expect(res.text).toContain('Enter message details');
      expect(res.text).toContain('Select yes if your message is about a hearing');
    });

    it('should trigger redirect on successful file upload', async () => {
      qmServiceMock.mockResolvedValue(new GenericForm(new FileUpload()));
      await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({action: 'uploadButton'})
        .expect(res => {
          expect(res.status).toBe(302);
        });
    });

    it('should render page with file upload error', async () => {
      const error = [{
        target: {
          fileUpload: '',
        },
        value: '',
        property: '',
        constraints: {
          isNotEmpty: 'ERRORS.VALID_MIME_TYPE_FILE',
        },
      }];
      qmServiceMock.mockResolvedValue(new GenericForm(new FileUpload(), error));
      await request(app).post(QUERY_MANAGEMENT_CREATE_QUERY).send({action: 'uploadButton'})
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('There was a problem');
          expect(res.text).toContain('Document must be Word');
        });
    });
  });
});
