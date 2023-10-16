import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_CARER_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../../test/utils/errorMessageTestConstants';
import {mockResponseFullAdmitPayBySetDate, mockCivilClaimOptionNo, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import severelyDisabledDefendantMock from './severelyDisabledDefendantMock.json';
import disabledPartnerMock from './disabledPartnerMock.json';
import disabledChildrenMock from './disabledChildrenMock.json';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

const withoutOtherDependentJson = require('./withoutOtherDependantsMock.json');
const option1ToRedirectToCarerJson = require('./option1ToRedirectToCarerMock.json');
const option2ToRedirectToCarerJson = require('./option2ToRedirectToCarerMock.json');

const civilClaimResponseWithoutOtherDependent: string = JSON.stringify(withoutOtherDependentJson);
const civilClaimResponseOption1ToRedirectToCarer: string = JSON.stringify(option1ToRedirectToCarerJson);
const civilClaimResponseOption2ToRedirectToCarer: string = JSON.stringify(option2ToRedirectToCarerJson);
export const civilClaimResponseSeverelyDisabledDefendant: string = JSON.stringify(severelyDisabledDefendantMock);
const civilClaimResponseDisabledPartnerMock: string = JSON.stringify(disabledPartnerMock);
const civilClaimResponseDisabledChildrenMock: string = JSON.stringify(disabledChildrenMock);

export function mockDraftStore(mockData: string) {
  return {
    set: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve(mockData)),
    ttl: jest.fn(() => Promise.resolve({})),
    expireat: jest.fn(() => Promise.resolve({})),
  };
}

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Other Dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return other dependants page', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you support anyone else financially?');
        });
    });

    it('should show "Number of people and Give details" section when "yes"', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Number of people');
          expect(res.text).toContain('Give details');
        });
    });

    it('should return error when Cannot read property \'numberOfPeople\' and \'details\' of undefined', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return empty OtherDependants object', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseWithoutOtherDependent);
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you support anyone else financially?');
        });
    });
  });

  describe('on POST', () => {
    it('should return error when radio box is not selected', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });

    it('should redirect when "no" is selected', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseDisabledPartnerMock);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect when "yes" is selected and number of people and details are valid', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseDisabledChildrenMock);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when defendant is disabled and severely disabled', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseSeverelyDisabledDefendant);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when partner is selected and disabled', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseDisabledChildrenMock);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when children is existing and any of them is disabled', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseDisabledPartnerMock);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect when disability, cohabiting and childrenDisability are "no"', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseOption1ToRedirectToCarer);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    it('should redirect when disability, cohabiting are "no" and partnerDisability is "yes"', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseOption2ToRedirectToCarer);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    it('should return error when number of people is undefined', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
        });
    });

    it('should return error when number of people is negative', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '-1', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_STRICTLY_POSITIVE_NUMBER);
        });
    });

    it('should return error when number of people is valid details is undefined', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '1', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DETAILS_REQUIRED);
        });
    });

    it('should return error when number of people and details are undefined', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
          expect(res.text).toContain(TestMessages.DETAILS_REQUIRED);
        });
    });

    it('should return error when number of people is 0 details is undefined', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '0', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
          expect(res.text).toContain(TestMessages.DETAILS_REQUIRED);
        });
    });

    it('should save when we dont have information on redis', async () => {
      app.locals.draftStoreClient = mockDraftStore(civilClaimResponseWithoutOtherDependent);
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should throw an error when call redis', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
