import config from 'config';
import nock from 'nock';
import {mockCivilClaimPDFTimeline, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {DmStoreClient} from '../../../../../../main/app/client/dmStoreClient';
import * as documentUtils from '../../../../../../main/common/utils/downloadUtils';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/client/dmStoreClient');

describe('Their PDF timeline controller', () => {
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

    test('should display the pdf successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const dmStoreClient = new DmStoreClient('baseURl');
      const mockResponse : Buffer = Buffer.from('22 30 45 50');
      const mockRetrieveDocumentById = jest.spyOn(dmStoreClient, 'retrieveDocumentByDocumentId').mockReturnValue(Promise.resolve(mockResponse));
      const mockDownLoadPDFDocument = jest.spyOn(documentUtils, 'downloadPDF');
      await request(app)
        .get('/case/1111/timeline/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(mockRetrieveDocumentById).toBeCalled();
          expect(mockDownLoadPDFDocument).toBeCalled();
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get('/case/1111/timeline/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});

