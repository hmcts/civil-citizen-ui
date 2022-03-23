import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_OTHER_DEPENDANTS_URL,
  CITIZEN_EMPLOYMENT_URL,
} from '../../../../../../../main/routes/urls';

const civilClaimResponseMock = require('../civilClaimResponseMock.json');
const noDisabilityMock = require('../noDisabilityMock.json');
const withoutOtherDependentJson = require('./withoutOtherDependantsMock.json');
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const civilClaimResponseWithoutDisability: string = JSON.stringify(noDisabilityMock);
const civilClaimResponseWithoutOtherDependent: string = JSON.stringify(withoutOtherDependentJson);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockNoDisabilityDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseWithoutDisability)),
};
const mockWithoutOtherDependents = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseWithoutOtherDependent)),
};
jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');


describe('Other Dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('on GET', () => {
  test('should return other dependants page', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .get(CITIZEN_OTHER_DEPENDANTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you support anyone else financially?');
      });
  });

  test('should show "Number of people and Give details" section when "yes"', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .get(CITIZEN_OTHER_DEPENDANTS_URL)
      .send('option=yes')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Number of people');
        expect(res.text).toContain('Give details');
      });
  });

  test('should return error when Cannot read property \'numberOfPeople\' and \'details\' of undefined', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({})),
      get: jest.fn(() => {throw new Error('Redis DraftStore failure.');})};
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .get(CITIZEN_OTHER_DEPENDANTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: 'Error: Redis DraftStore failure.'});
      });
  });

  test('should return empty OtherDependants object', async () => {
    app.locals.draftStoreClient = mockWithoutOtherDependents;
    await request(app)
      .get(CITIZEN_OTHER_DEPENDANTS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you support anyone else financially?');
      });
  });
});

describe('on POST', () => {
  test('should return error when radio box is not selected', async () => {
    app.locals.draftStoreClient = mockNoDisabilityDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Choose option: Yes or No');
      });
  });

  test('should redirect when "no" is selected', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'no', numberOfPeople: '', details: '' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
      });
  });

  test('should redirect when "yes" is selected and number of people and details are valid', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
      });
  });

  test('should return error when number of people is undefined', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'yes', numberOfPeople: '', details: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter a numeric, for example 3');
      });
  });

  test('should return error when number of people is 0', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'yes', numberOfPeople: '0', details: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter a number higher than 0');
      });
  });

  test('should return error when number of people is valid details is undefined', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'yes', numberOfPeople: '1', details: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter details');
      });
  });

  test('should return error when number of people and details are undefined', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'yes', numberOfPeople: '', details: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter a numeric, for example 3');
        expect(res.text).toContain('Enter details');
      });
  });

  test('should return error when number of people is 0 details is undefined', async () => {
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'yes', numberOfPeople: '0', details: '' })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter a number higher than 0');
        expect(res.text).toContain('Enter details');
      });
  });
  test('should save when we dont have information on redis', async () => {
    app.locals.draftStoreClient = mockWithoutOtherDependents;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
      });
  });
  test('should throw an error when call redis', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({})),
      get: jest.fn(() => {throw new Error('Redis DraftStore failure.');})};
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_OTHER_DEPENDANTS_URL)
      .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: 'Error: Redis DraftStore failure.'});
      });
  });
});
