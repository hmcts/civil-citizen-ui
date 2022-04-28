import { app } from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { COMPANY_TELEPHONE_NUMBER_URL, CLAIM_TASK_LIST_URL } from '../../../../../../../main/routes/urls';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockRedisFailure } from '../../../../../../utils/mockDraftStore';
// import { mockCivilClaim} from '../../../../../../utils/mockDraftStore';
import {
  VALID_YES_NO_OPTION,
  PHONE_NUMBER_REQUIRED,
  NAME_REQUIRED,
  TEXT_TOO_LONG,
  // TEXT_TOO_LONG,
  // VALID_OWED_AMOUNT_REQUIRED, VALID_REASON_REQUIRED, VALID_TWO_DECIMAL_NUMBER
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { YesNo } from '../../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
  describe('on Get', () => {
    test('should return on compant telephone number page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(COMPANY_TELEPHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          // TODO : update with the name what property should I use from claim
          expect(res.text).toContain('Are you behind on tax payments?');
        });
    });
    test('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(COMPANY_TELEPHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
  describe('on Post', () => {
    const validPhoneNumber = '012345678901234567890123456789';
    const inValidPhoneNumber = '0123456789012345678901234567890';
    const validName = 'David';
    const inValidName = 'Daviddaviddaviddaviddaviddavido';
    test('should return error when option is not selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should have errors when yes is an option, but no telephone number is provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
        });
    });
    test('should have errors when yes is an option but a long telephone number is provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.YES, mediationPhoneNumber: null, mediationContactName: null, mediationPhoneNumberConfirmation: inValidPhoneNumber })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
          // expect(res.text).toContain(VALID_REASON_REQUIRED);
        });
    });
    test('should have errors when no is an option, but no other thing provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NAME_REQUIRED);
          expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
        });
    });
    test('should have errors when no is an option, contact number is provided but no contact name', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactName:null   })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NAME_REQUIRED);
          // expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
        });
    });
    test('should have errors when no is an option, contact name is provided but no contact number', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: null, mediationContactName: validName })
        .expect((res) => {
          expect(res.status).toBe(200);
          // expect(res.text).toContain(NAME_REPHOQUIRED);
          expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
        });
    });
    test('should have errors when no is an option but both contact name and contact number are too long', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: inValidPhoneNumber, mediationContactName: inValidName })
        .expect((res) => {
          expect(res.status).toBe(200);
          // expect(res.text).toContain(NAME_REPHOQUIRED);
          expect(res.text).toContain(TEXT_TOO_LONG);
        });
    });

    // test('should have no errors when yes is an option but a telephone number is provided', async () => {
    //   await request(app)
    //     .post(COMPANY_TELEPHONE_NUMBER_URL)
    //     .send({ option: YesNo.YES, mediationPhoneNumber: null, mediationContactName: null, mediationPhoneNumberConfirmation: validPhoneNumber })
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
    //       // expect(res.text).toContain(VALID_REASON_REQUIRED);
    //     });
    // });
    


  //   test('should return errors when option yes is selected and amount is 0', async () => {
  //     await request(app)
  //       .post(COMPANY_TELEPHONE_NUMBER_URL)
  //       .send({ option: YesNo.YES, amountYouOwe: 0, reason: 'reason' })
  //       .expect((res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.text).toContain(VALID_OWED_AMOUNT_REQUIRED);
  //       });
  //   });
  //   test('should return errors when option yes is selected and amount is -1', async () => {
  //     await request(app)
  //       .post(COMPANY_TELEPHONE_NUMBER_URL)
  //       .send({ option: YesNo.YES, amountYouOwe: -1, reason: 'reason' })
  //       .expect((res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.text).toContain(VALID_OWED_AMOUNT_REQUIRED);
  //       });
  //   });
  //   test('should return errors when option yes is selected and amount is abc', async () => {
  //     await request(app)
  //       .post(COMPANY_TELEPHONE_NUMBER_URL)
  //       .send({ option: YesNo.YES, amountYouOwe: 'abc', reason: 'reason' })
  //       .expect((res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.text).toContain(VALID_TWO_DECIMAL_NUMBER);
  //       });
  //   });
  //   test('should return errors when option yes is selected and amount has more than two decimal places', async () => {
  //     await request(app)
  //       .post(COMPANY_TELEPHONE_NUMBER_URL)
  //       .send({ option: YesNo.YES, amountYouOwe: 44.4444, reason: 'reason' })
  //       .expect((res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.text).toContain(VALID_TWO_DECIMAL_NUMBER);
  //       });
  //   });
  //   test('should return errors when option yes is selected and reason is not selected', async () => {
  //     await request(app)
  //       .post(COMPANY_TELEPHONE_NUMBER_URL)
  //       .send({ option: YesNo.YES, amountYouOwe: 44.44, reason: '' })
  //       .expect((res) => {
  //         expect(res.status).toBe(200);
  //         expect(res.text).toContain(VALID_REASON_REQUIRED);
  //       });
  //   });
    test('should redirect with valid input', async () => {
      
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactName: validName })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    test('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: validPhoneNumber, mediationContactName: validName })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
});
