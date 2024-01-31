import config from 'config';
import nock from 'nock';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');

describe('Document download controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should download successfully', async () => {
      //given
      const responseHeaders =  {
        'content-type': 'application/json',
        'originalfilename': 'example.json',
      };
      const responseBody = Buffer.from('111');

      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(200, responseBody, responseHeaders);

      //then
      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL.replace(':documentId', '111'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBe(111);
        });

    });

    it('should return http 500 when has error', async () => {
      //given
      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(500);

      //then
      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL.replace(':documentId', '111'))
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
