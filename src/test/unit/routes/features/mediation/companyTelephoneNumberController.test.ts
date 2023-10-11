import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CAN_WE_USE_COMPANY_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'form/models/yesNo';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {getCompanyTelephoneNumberData} from 'services/features/response/mediation/companyTelephoneNumberService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('services/features/response/mediation/companyTelephoneNumberService');

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return on company telephone number page successfully', async () => {
      (getCompanyTelephoneNumberData as jest.Mock).mockResolvedValue(['Felipe', '123345']);
      await request(app).get(CAN_WE_USE_COMPANY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is ' + civilClaimResponseMock.case_data.respondent1.partyDetails.contactPerson + ' the right person for the mediation service to call?');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      (getCompanyTelephoneNumberData as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));
      await request(app)
        .get(CAN_WE_USE_COMPANY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    const validPhoneNumber = '012345678901234567890123456789';
    const inValidPhoneNumber = '0123456789012345678901234567890';
    const validName = 'David';
    const inValidName = 'Daviddaviddaviddaviddaviddavido';
    it('should return error when option is not selected', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue({
        isClaimantIntentionPending: jest.fn().mockReturnValue(false),
      });
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({contactPerson: 'Test contact person'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });
    it('should have errors when yes is an option, but no telephone number is provided', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
        });
    });
    it('should have errors when yes is an option but a long telephone number is provided', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({
          option: YesNo.YES,
          mediationPhoneNumber: null,
          mediationContactPerson: null,
          mediationPhoneNumberConfirmation: inValidPhoneNumber,
          contactPerson: 'Test contact person',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You&#39;ve entered too many characters');
        });
    });
    it('should have errors when no is an option, but no other thing provided', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NAME_REQUIRED);
          expect(res.text).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
        });
    });
    it('should have errors when no is an option, contact number is provided but no contact name', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.NAME_REQUIRED);
        });
    });
    it('should have errors when no is an option, contact name is provided but no contact number', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO, mediationPhoneNumber: null, mediationContactPerson: validName})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
        });
    });
    it('should have errors when no is an option but both contact name and contact number are too long', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO, mediationPhoneNumber: inValidPhoneNumber, mediationContactPerson: inValidName})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You&#39;ve entered too many characters');
        });
    });
    it('should redirect with valid input', async () => {
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: validName})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return status 500 when there is error', async () => {
      (getCaseDataFromStore as jest.Mock).mockRejectedValueOnce(new Error('Redis error'))
      await request(app)
        .post(CAN_WE_USE_COMPANY_URL)
        .send({option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactPerson: validName})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
