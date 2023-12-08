import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CAN_WE_USE_COMPANY_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {YesNo} from 'form/models/yesNo';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on company telephone number page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CAN_WE_USE_COMPANY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is ' + civilClaimResponseMock.case_data.respondent1.partyDetails.contactPerson + ' the right person for the mediation service to call?');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
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
      app.locals.draftStoreClient = mockCivilClaim;
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
      app.locals.draftStoreClient = mockRedisFailure;
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

afterAll(() => {
  global.gc && global.gc();
});