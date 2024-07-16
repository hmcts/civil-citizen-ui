import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  AGE_ELIGIBILITY_URL,
  DOB_URL,
  CITIZEN_PHONE_NUMBER_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import noStatementOfMeansMock from '../../../../../utils/mocks/noStatementOfMeansMock.json';
import {Claim} from 'models/claim';
import civilClaimResponseRespondentIndividualWithPhoneNumber
  from '../../../../../utils/mocks/civilClaimResponseRespondentIndividualWithPhoneNumberMock.json';
import civilClaimResponseApplicantIndividual
  from '../../../../../utils/mocks/civilClaimResponseApplicantIndividualMock.json';
import civilClaimResponseRespondentIndividualWithoutPhoneNumber
  from '../../../../../utils/mocks/civilClaimResponseRespondentIndividualWithoutPhoneNumberMock.json';
import civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse
  from '../../../../../utils/mocks/civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalseMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Citizen date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return citizen date of birth page empty when dont have information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });

      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });
    it('should return citizen date of birth page with all information from redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), undefined);
      });
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return errors on no input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on empty year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return error on future date', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DATE'));
        });
    });
    it('should return error 4 digit year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to under 18 contact court page', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to under 18 contact court page when has information on redis', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB when has undefined on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    describe('Redirect to phone-number or task-list screen', () => {
      it('should redirect to task-list screen if phone-number provided', async () => {
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseRespondentIndividualWithPhoneNumber.case_data);
        });
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });
      it('should redirect to phone-number screen if phone-number NOT provided', async () => {
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseApplicantIndividual.case_data);
        });
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
      it('should redirect to phone-number screen if phone-number is empty', async () => {
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseRespondentIndividualWithoutPhoneNumber.case_data);
        });
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
      it('should redirect to phone-number screen if ccd phone number exist is false', async () => {
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse.case_data);
        });
        mockGetCaseData.mockImplementation(async () => {
          return Object.assign(new Claim(), civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse.case_data);
        });
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
    });
  });
});
