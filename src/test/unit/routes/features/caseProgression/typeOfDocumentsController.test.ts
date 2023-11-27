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
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

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
      await request(app).get(typeOfDocumentUrl).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.TITLE'));
      });
    });

    it('should render page successfully on defendant request if cookie has correct values', async () => {
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      await request(app).get(typeOfDocumentUrl).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.TITLE'));
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
