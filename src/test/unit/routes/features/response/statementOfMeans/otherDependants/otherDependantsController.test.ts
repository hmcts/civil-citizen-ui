import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_CARER_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import severelyDisabledDefendantMock from './severelyDisabledDefendantMock.json';
import disabledPartnerMock from './disabledPartnerMock.json';
import disabledChildrenMock from './disabledChildrenMock.json';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import civilClaimResponseOptionNoMock from '../../../../../../utils/mocks/civilClaimResponseOptionNoMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const withoutOtherDependentJson = require('./withoutOtherDependantsMock.json');
const option1ToRedirectToCarerJson = require('./option1ToRedirectToCarerMock.json');
const option2ToRedirectToCarerJson = require('./option2ToRedirectToCarerMock.json');

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Other Dependants', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return other dependants page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you support anyone else financially?');
        });
    });

    it('should show "Number of people and Give details" section when "yes"', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_OTHER_DEPENDANTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return empty OtherDependants object', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), withoutOtherDependentJson.case_data);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseOptionNoMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });

    it('should redirect when "no" is selected', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), disabledPartnerMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect when "yes" is selected and number of people and details are valid', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), disabledChildrenMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when defendant is disabled and severely disabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), severelyDisabledDefendantMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when partner is selected and disabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), disabledChildrenMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect employment page when children is existing and any of them is disabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), disabledPartnerMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({option: 'no', numberOfPeople: '', details: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should redirect when disability, cohabiting and childrenDisability are "no"', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), option1ToRedirectToCarerJson.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    it('should redirect when disability, cohabiting are "no" and partnerDisability is "yes"', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), option2ToRedirectToCarerJson.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_CARER_URL);
        });
    });

    it('should return error when number of people is undefined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
        });
    });

    it('should return error when number of people is negative', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '-1', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_STRICTLY_POSITIVE_NUMBER);
        });
    });

    it('should return error when number of people is valid details is undefined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'yes', numberOfPeople: '1', details: '' })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DETAILS_REQUIRED);
        });
    });

    it('should return error when number of people and details are undefined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), withoutOtherDependentJson.case_data);
      });
      await request(app)
        .post(CITIZEN_OTHER_DEPENDANTS_URL)
        .send({ option: 'no', numberOfPeople: '1', details: 'Test details' })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_EMPLOYMENT_URL);
        });
    });

    it('should throw an error when call redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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
