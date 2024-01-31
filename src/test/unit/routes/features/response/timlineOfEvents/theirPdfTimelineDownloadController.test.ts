import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as documentUtils from '../../../../../../main/common/utils/downloadUtils';

jest.mock('../../../../../../main/modules/oidc');

describe('Their PDF timeline controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {

    it('should display the pdf successfully', async () => {
      const mockDisplayPDFDocument = jest.spyOn(documentUtils, 'displayPDF');
      const responseHeaders = {
        'content-type': 'application/pdf',
        'original-file-name': 'example.pdf',
      };
      const responseBody = Buffer.from('111');
      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(200, responseBody, responseHeaders);
      await request(app).get('/case/123/documents/timeline/111')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockDisplayPDFDocument).toBeCalled();
        });
    });

    it('should return http 500 when has error', async () => {
      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(500);
      await request(app)
        .get('/case/123/documents/timeline/111')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
