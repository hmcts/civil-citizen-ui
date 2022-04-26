import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../../../../main/routes/urls';
import {
  REDIS_FAILURE,
  VALID_YES_NO_OPTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {Logger} from 'winston';
import {
  setChildrenDisabilityControllerLogger,
} from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/childrenDisabilityController';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const noStatementOfMeansMock = require('../noStatementOfMeansMock.json');
const noChildrenDisabilityResponse: string = JSON.stringify(noStatementOfMeansMock);

const mockNoChildrenDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(noChildrenDisabilityResponse)),
};
const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as Logger;

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

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
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CHILDREN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.errorMessage).toEqual(REDIS_FAILURE);
          expect(mockLogger.error).toHaveBeenCalled();
        });
    });


    test('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body.errorMessage).toEqual(REDIS_FAILURE);
          expect(mockLogger.error).toHaveBeenCalled();
        });
    });
  });

  describe('on GET', () => {
    test('should return children disability page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
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
    test('should reflect data from draft store on disability page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(CHILDREN_DISABILITY_URL);
      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios.length).toBe(2);
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[0].getAttribute('checked')).toBe('');
      expect(radios[1].getAttribute('value')).toBe('no');
      expect(radios[1].getAttribute('checked')).toBeNull();
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
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CHILDREN_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_OTHER_DEPENDANTS_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
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
