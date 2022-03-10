import { app } from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import { CITIZEN_DETAILS_URL } from '../../../../../../main/routes/urls';
import {
  VALID_ADDRESS_LINE_1,
  VALID_CITY,
  VALID_POSTCODE,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { mockClaim as mockResponse } from '../../../../../../test/utils/mockClaim';
import {CivilClaimResponse} from '../../../../../../main/common/models/civilClaimResponse';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const nock = require('nock');

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    nock('http://localhost:8765')
      .get('/cases/1643033241924739')
      .reply(200, mockResponse);
    nock('http://localhost:4000')
      .get('/cases/1643033241924739')
      .reply(200, mockResponse);
  });

  test('should return your details page', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: mockResponse })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  test('POST/Citizen details - should redirect on correct primary address', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  test('POST/Citizen details - should redirect on correct correspondence address', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  test('POST/Citizen details - should return error on empty primary address line', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
      });
  });

  test('POST/Citizen details - should return error on empty primary city', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CITY);
      });
  });

  test('POST/Citizen details - should return error on empty primary postcode', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence address line', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve({ data: JSON.stringify(mockResponse) })),

    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence city', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
      });
  });

  test('POST/Citizen details - should return error on empty correspondence postcode', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on no input', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on input for primary address when postToThisAddress is set to NO', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  test('POST/Citizen details - should return error on input for correspondence address when postToThisAddress is set to YES', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        postToThisAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  test('get/Citizen details - should return test variable when there is no data on redis and civil-service', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
      get: jest.fn(() => Promise.resolve(JSON.stringify(new CivilClaimResponse()))),
    };
    nock('http://localhost:4000')
      .get('/cases/1111')
      .reply(400);
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .get('/case/1111/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('individualTitle Test');
      });
  });

});
