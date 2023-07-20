import config from 'config';
import nock from 'nock';
// import {mockCivilClaimPDFTimeline, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import request from 'supertest';
// import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
// import * as documentUtils from '../../../../../../main/common/utils/downloadUtils';
import {CASE_TIMELINE_DOCUMENTS_URL} from 'routes/urls';

jest.mock('../../../../../../main/modules/oidc');
// jest.mock('../../../../../../main/modules/draft-store');
// jest.mock('../../../../../../main/app/client/dmStoreClient');

describe('Their PDF timeline controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    beforeEach(() => {
      const responseHeaders = {
        'content-type': 'application/pdf',
        'original-file-name': 'example.pdf',
      };
      const responseBody = Buffer.from('111');
      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(200, responseBody, responseHeaders);
    })
    it('should display the pdf successfully', async () => {
      // const mockDisplayPDFDocument = jest.spyOn(documentUtils, 'displayPDF');
      const responseHeaders = {
        'content-type': 'application/pdf',
        'original-file-name': 'example.pdf',
      };
      const responseBody = Buffer.from('111');
      nock('http://localhost:4000')
        .get('/case/document/downloadDocument/111')
        .reply(200, responseBody, responseHeaders);
      await request(app)
        .get(CASE_TIMELINE_DOCUMENTS_URL.replace(':documentId', '111'))
        .expect((res) => {
          expect(res.status).toBe(200);
          // expect(mockDisplayPDFDocument).toBeCalled();
          expect(res.body).toBe(111);
        });
    });

    // it('should return http 500 when has error', async () => {
    //   await request(app)
    //     .get('/case/1111/documents/timeline')
    //     .expect((res) => {
    //       expect(res.status).toBe(500);
    //       expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    //     });
    // });
  });
});

