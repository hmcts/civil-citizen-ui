import config from 'config';
import nock from 'nock';
import {mockCivilClaimPDFTimeline, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../../../../main/routes/urls';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as documentUtils from '../../../../../main/common/utils/downloadUtils';
import {DocumentUri} from '../../../../../main/common/models/document/documentType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/client/civilServiceClient');

describe('Document download controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    afterEach(() => {
      app.locals.draftStoreClient = undefined;
    });

    it('should download the pdf successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const mockDownloadPDFDocument = jest.spyOn(documentUtils, 'downloadPDF');
      await request(app)
        .get(CASE_DOCUMENT_DOWNLOAD_URL.replace(':documentType', DocumentUri.SEALED_CLAIM))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockDownloadPDFDocument).toBeCalled();
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

