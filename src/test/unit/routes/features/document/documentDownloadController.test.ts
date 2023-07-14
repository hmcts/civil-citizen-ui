import config from 'config';
import nock from 'nock';
import {mockCivilClaimPDFTimeline, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as documentUtils from '../../../../../main/common/utils/downloadUtils';
import {DocumentUri} from 'models/document/documentType';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Document download controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should download the claim pdf successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const mockDownloadPDFDocument = jest.spyOn(documentUtils, 'downloadPDF');
      const mockResponse = '<Buffer 25 50 44 73 5b 20 32 20 30 20 52 20 20 34 20 30 20 52 20>';

      nock('http://localhost:4000')
        .get('/cases/12345')
        .reply(200, civilClaimResponseMock);

      nock('http://localhost:4000')
        .post('/case/document/downloadSealedDoc/')
        .reply(200, mockResponse);

      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '12345').replace(':documentType', DocumentUri.SEALED_CLAIM))
        .expect((res) => {
          expect(mockDownloadPDFDocument).toBeCalled();
          expect(res.status).toEqual(200);
        });
    });

    it('should download the response pdf successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const mockDownloadPDFDocument = jest.spyOn(documentUtils, 'downloadPDF');
      const mockResponse = '<Buffer 25 50 44 73 5b 20 32 20 30 20 52 20 20 34 20 30 20 52 20>';

      nock('http://localhost:4000')
        .get('/cases/12345')
        .reply(200, civilClaimResponseMock);

      nock('http://localhost:4000')
        .post('/case/document/downloadSealedDoc/')
        .reply(200, mockResponse);

      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '12345').replace(':documentType', DocumentUri.DEFENDANT_DEFENCE))
        .expect((res) => {
          expect(mockDownloadPDFDocument).toBeCalled();
          expect(res.status).toEqual(200);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
