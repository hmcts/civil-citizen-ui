import express from 'express';

const request = require('supertest');
const {app} = require('../../../../../../../main/app');
import nock from 'nock';
import config from 'config';
import {
  VALID_ENTER_AT_LEAST_ONE_NUMBER,
  VALID_INTEGER_REQUIRED,
  VALID_POSITIVE_NUMBER_REQUIRED,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

const respondentDependantsUrl = CITIZEN_DEPENDANTS_URL.replace(':id', 'aaa');
const DRAFT_STORE_EXCEPTION = 'Draft store exception';
const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{"id": "id", "case_data": {"statementOfMeans": {}}}')),
  set: jest.fn(() => Promise.resolve()),
};

const mockGetExceptionDraftStore = {
  get: jest.fn(() => {
    throw new Error(DRAFT_STORE_EXCEPTION);
  }),
  set: jest.fn(() => Promise.resolve()),
};

describe('Citizen dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    test('should return dependants page', async () => {
      await request(app)
        .get(respondentDependantsUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do any children live with you?');
        });
    });
    test('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .get(respondentDependantsUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({errorMessage: DRAFT_STORE_EXCEPTION});
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    test('when Yes option and under11 field filled in should redirect to Other Dependants screen', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_OTHER_DEPENDANTS_URL.replace(':id', 'aaa'));
        });
    });
    test('when Yes option and between16and19 field filled in should redirect to Dependants Education screen', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between16and19=1')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_DEPENDANTS_EDUCATION_URL.replace(':id', 'aaa'));
        });
    });
    test('should show error when Yes option and no number is filled in', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AT_LEAST_ONE_NUMBER);
        });
    });
    test('should show error when Yes option and invalid under11 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(VALID_POSITIVE_NUMBER_REQUIRED);
        });
    });
    test('should show error when Yes option and invalid between11and15 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between11and15=-1')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(VALID_POSITIVE_NUMBER_REQUIRED);
        });
    });
    test('should show error when Yes option and invalid between16and19 input', async () => {
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('between16and19=1.5')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toMatch(VALID_INTEGER_REQUIRED);
        });
    });
    test('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .post(respondentDependantsUrl)
        .send('declared=yes')
        .send('under11=1')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({errorMessage: DRAFT_STORE_EXCEPTION});
        });
    });
  });
});
