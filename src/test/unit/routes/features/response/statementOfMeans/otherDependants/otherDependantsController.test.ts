import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_CARER_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {
  DETAILS_REQUIRED,
  NUMBER_OF_PEOPLE_REQUIRED,
  VALID_STRICTLY_POSITIVE_NUMBER,
  VALID_YES_NO_OPTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {TestMessages} from '../../../../../../../test/utils/errorMessageTestConstants';
import {mockCivilClaim, mockCivilClaimOptionNo, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import severelyDisabledDefendantMock from './severelyDisabledDefendantMock.json';
import disabledPartnerMock from './disabledPartnerMock.json';
import disabledChildrenMock from './disabledChildrenMock.json';

const civilClaimResponseMock = require('../../../../../../utils/mocks/civilClaimResponseMock.json');
const withoutOtherDependentJson = require('./withoutOtherDependantsMock.json');
const option1ToRedirectToCarerJson = require('./option1ToRedirectToCarerMock.json');
const option2ToRedirectToCarerJson = require('./option2ToRedirectToCarerMock.json');

const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const civilClaimResponseWithoutOtherDependent: string = JSON.stringify(withoutOtherDependentJson);
const civilClaimResponseOption1ToRedirectToCarer: string = JSON.stringify(option1ToRedirectToCarerJson);
const civilClaimResponseOption2ToRedirectToCarer: string = JSON.stringify(option2ToRedirectToCarerJson);
const civilClaimResponseSeverelyDisabledDefendant: string = JSON.stringify(severelyDisabledDefendantMock);
const civilClaimResponseDisabledPartnerMock: string = JSON.stringify(disabledPartnerMock);
const civilClaimResponseDisabledChildrenMock: string = JSON.stringify(disabledChildrenMock);

const mockRedisException = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};
const mockWithoutOtherDependents = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseWithoutOtherDependent)),
};
const mockWithOption1ToRedirectToCarer = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseOption1ToRedirectToCarer)),
};
const mockWithOption2ToRedirectToCarer = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseOption2ToRedirectToCarer)),
};
const mockWithSeverelyDisabledDefendant = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseSeverelyDisabledDefendant)),
};
const mockWithDisabledPartner = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseDisabledChildrenMock)),
};
const mockWithDisabledChildren = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseDisabledPartnerMock)),
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

  describe('on GET', () => {
    test('should return other dependants page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you support anyone else financially?');
        });
    });

    test('should show "Number of people and Give details" section when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
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
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: TestMessages.REDIS_FAILURE });
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
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });

    test('should redirect when "no" is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    test('should redirect when "yes" is selected and number of people and details are valid', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    test('should redirect employment page when defendant is disabled and severely disabled', async () => {
      app.locals.draftStoreClient = mockWithSeverelyDisabledDefendant;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    test('should redirect employment page when partner is selected and disabled', async () => {
      app.locals.draftStoreClient = mockWithDisabledPartner;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    test('should redirect employment page when children is existing and any of them is disabled', async () => {
      app.locals.draftStoreClient = mockWithDisabledChildren;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    test('should redirect when disability, cohabiting and childrenDisability are "no"', async () => {
      app.locals.draftStoreClient = mockWithOption1ToRedirectToCarer;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    test('should redirect when disability, cohabiting are "no" and partnerDisability is "yes"', async () => {
      app.locals.draftStoreClient = mockWithOption2ToRedirectToCarer;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    test('should return error when number of people is undefined', async () => {
      app.locals.draftStoreClient = mockRedisException;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NUMBER_OF_PEOPLE_REQUIRED);
        });
    });

    test('should return error when number of people is 0', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '0', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_STRICTLY_POSITIVE_NUMBER);
        });
    });

    test('should return error when number of people is valid details is undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '1', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(DETAILS_REQUIRED);
        });
    });

    test('should return error when number of people and details are undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NUMBER_OF_PEOPLE_REQUIRED);
          expect(res.text).toContain(DETAILS_REQUIRED);
        });
    });

    test('should return error when number of people is 0 details is undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '0', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_STRICTLY_POSITIVE_NUMBER);
          expect(res.text).toContain(DETAILS_REQUIRED);
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
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
});
