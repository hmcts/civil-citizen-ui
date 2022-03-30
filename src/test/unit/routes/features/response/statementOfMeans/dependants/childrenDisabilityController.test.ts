import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../../../../main/routes/urls';
import {VALID_YES_NO_OPTION} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {LoggerInstance} from 'winston';
import {
  setChildrenDisabilityControllerLogger,
} from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/childrenDisabilityController';


const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const noStatementOfMeansMock = require('../noStatementOfMeansMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const noChildrenDisabilityResponse: string = JSON.stringify(noStatementOfMeansMock);

const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoChildrenDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noChildrenDisabilityResponse)),
};
const mockErrorDraftStore = {
  set: jest.fn(() => {
    throw new Error('Redis DraftStore failure.');
  }),
  get: jest.fn(() => {
    throw new Error('Redis DraftStore failure.');
  }),
};
const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;


jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

const redisFailureError = 'Redis DraftStore failure.';

describe('Children Disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    setChildrenDisabilityControllerLogger(mockLogger);
  });

  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .get(CHILDREN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.errorMessage).toEqual(redisFailureError);
          expect(mockLogger.error).toHaveBeenCalledWith(expect.stringMatching(redisFailureError));
        });
    });


    test('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockErrorDraftStore;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.errorMessage).toEqual(redisFailureError);
          expect(mockLogger.error).toHaveBeenCalledWith(expect.stringMatching(redisFailureError));
        });
    });
  });

  describe('on GET', () => {
    test('should return children disability page', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .get(CHILDREN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are any of the children who live with you disabled?');
        });
    });
    test('should show disability page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoChildrenDisabilityDraftStore;
      await request(app)
        .get(CHILDREN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });

  describe('on POST', () => {
    test('should redirect page when "no" and no statement of means', async () => {
      app.locals.draftStoreClient = mockNoChildrenDisabilityDraftStore;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
  });

});
