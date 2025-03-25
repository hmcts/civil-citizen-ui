import request from 'supertest';
import {app} from '../../../../../main/app';
import {QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as QueryManagementService from 'services/features/queryManagement/queryManagementService';
import {Session} from 'express-session';

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

  it('should call through to removeSelectedDocument when the query param is passed', async () => {
    const prefilledData = {'query-message-field': 'test sub', 'query-subject-field': 'test body', 'is-query-hearing-related': 'yes'};
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
