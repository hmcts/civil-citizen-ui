import request from 'supertest';
import {
  mockCivilClaim,
  mockRedisFailure,
  mockCivilClaimDefendantCaseProgression,
} from '../../../../utils/mockDraftStore';
import {
  TYPES_OF_DOCUMENTS_URL,
  CP_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import express from 'express';
import * as fileUploadUtils from 'common/utils/fileUploadUtils';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const typeOfDocumentUrl = TYPES_OF_DOCUMENTS_URL.replace(':id', 'aaa');

describe('Upload document- type of documents controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    it('should render page successfully if cookie has correct values', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What types of documents do you want to upload?');
        expect(res.text).toContain('Hearing');
      });
    });

    it('should render page successfully in Welsh if cookie has correct values and query gives cy', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(typeOfDocumentUrl).query({lang: 'cy'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Pa fath o ddogfennau ydych chi eisiau eu huwchlwytho?');
        expect(res.text).toContain('Gwrandawiad');
      });
    });

    it('should render page successfully on defendant request if cookie has correct values', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What types of documents do you want to upload?');
        expect(res.text).toContain('Hearing');
      });
    });

    it('should render page successfully  in Welsh on defendant request if cookie has correct values and query gives cy', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      await request(app).get(typeOfDocumentUrl).query({lang: 'cy'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Pa fath o ddogfennau ydych chi eisiau eu huwchlwytho?');
        expect(res.text).toContain('Gwrandawiad');
      });
    });

    it('should display the no valid documents error when redirected from check your answers', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const spyFileUploadErrors = jest.spyOn(fileUploadUtils, 'getFileUploadErrorsForSource')
        .mockReturnValueOnce(fileUploadUtils.createNoValidDocumentsError());
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('There was a problem');
        expect(res.text).toContain('We could not submit your documents. Please upload them again and try submitting.');
        expect(res.text).toContain('What types of documents do you want to upload?');
      });
      expect(spyFileUploadErrors).toHaveBeenCalledWith(expect.anything(), fileUploadUtils.FILE_UPLOAD_SOURCE.CP_TYPE_OF_DOCUMENTS);
    });

    it('should display the no valid documents error in Welsh when redirected from check your answers', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      jest.spyOn(fileUploadUtils, 'getFileUploadErrorsForSource')
        .mockReturnValueOnce(fileUploadUtils.createNoValidDocumentsError());
      await request(app).get(typeOfDocumentUrl).query({lang: 'cy'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Ni allem gyflwyno eich dogfennau. Uwchlwythwch nhw eto a cheisiwch eu cyflwyno.');
      });
    });

    it('should not display the no valid documents error when there is none in the session', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(typeOfDocumentUrl).query({lang: 'en'}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).not.toContain('We could not submit your documents. Please upload them again and try submitting.');
      });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(typeOfDocumentUrl)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });
    it('should display error when there is no option selection', async () => {
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          model: {items:[]},
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_ENTER_AT_LEAST_ONE_UPLOAD);
        });
    });

    it('when at least 1 is  selected, should redirect to Upload documents screen', async () => {
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          documents: 'documents',
          list: 'list',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CP_UPLOAD_DOCUMENTS_URL.replace(':id', 'aaa'));
        });
    });

    it('when at least 1 is  selected, should redirect to Upload documents screen on defendant request', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      await request(app)
        .post(typeOfDocumentUrl)
        .send({
          documents: 'documents',
          list: 'list',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CP_UPLOAD_DOCUMENTS_URL.replace(':id', 'aaa'));
        });
    });
  });
});
