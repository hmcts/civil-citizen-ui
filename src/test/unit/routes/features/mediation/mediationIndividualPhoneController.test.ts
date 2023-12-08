import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CAN_WE_USE_URL, RESPONSE_TASK_LIST_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockCivilClaimantIntention, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {PartyPhone} from '../../../../../main/common/models/PartyPhone';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

const noRespondentTelephoneMock = require('../../../../utils/mocks/noRespondentTelephoneMock.json');
const civilClaimResponseMockWithoutRespondentPhone: string = JSON.stringify(noRespondentTelephoneMock);
const mockWithoutRespondentPhone = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithoutRespondentPhone)),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
noRespondentTelephoneMock.case_data.respondent1.partyPhone = new PartyPhone('1234');

const civilClaimResponseMockWithRespondentPhone: string = JSON.stringify(noRespondentTelephoneMock);
const mockWithRespondentPhone = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithRespondentPhone)),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on mediation confirm your telephone number repayment plan page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CAN_WE_USE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Confirm your telephone number');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CAN_WE_USE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should return on mediation confirm your telephone number repayment plan page without partyPhone', async () => {
      app.locals.draftStoreClient = mockWithoutRespondentPhone;
      await request(app).get(CAN_WE_USE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
  });

  describe('on Post', () => {
    it('should return error when no input text is filled', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });
    it('should return errors when "NO" option selected and telephone number is undefined ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'no', mediationPhoneNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
        });
    });
    it('should return errors when "NO" option selected and telephone number max length is greater than 30 characters ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'no', mediationPhoneNumber: '1234567890123456789012345678900'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
        });
    });
    it('should redirect with valid input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'no', mediationPhoneNumber: '01632960001'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect with mediationDisagreement', async () => {
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'no', mediationPhoneNumber: '01632960001'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to claimant task list with valid input', async () => {
      app.locals.draftStoreClient = mockCivilClaimantIntention;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'no', mediationPhoneNumber: '01632960001'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect with input option equal to "yes" ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'yes', mediationPhoneNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({option: 'yes', mediationPhoneNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    describe('Enter Phone Number Screen', () => {
      it('should redirect with valid input', async () => {
        app.locals.draftStoreClient = mockWithoutRespondentPhone;
        await request(app)
          .post(CAN_WE_USE_URL)
          .send({option: 'no', mediationPhoneNumber: '01632960002'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });
      it('should redirect with valid input diferent ccdState with respondent phone', async () => {
        app.locals.draftStoreClient = mockWithRespondentPhone;
        await request(app)
          .post(CAN_WE_USE_URL)
          .send({option: 'no', mediationPhoneNumber: '01632960002'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });
      it('should redirect claimant task list with valid input', async () => {
        app.locals.draftStoreClient = mockCivilClaimantIntention;
        await request(app)
          .post(CAN_WE_USE_URL)
          .send({option: 'no', mediationPhoneNumber: '01632960002'})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
          });
      });
    });
  });
});

afterAll(() => {
  global.gc && global.gc();
});
