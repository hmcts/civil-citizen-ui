import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CAN_WE_USE_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {
  PHONE_NUMBER_REQUIRED,
  VALID_YES_NO_OPTION,
  VALID_TEXT_LENGTH,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const civilClaimResponseMock = require('../../../views/features/mediation/noRespondentTelephoneMock.json');
civilClaimResponseMock.case_data.respondent1.telephoneNumber = '';
const civilClaimResponseMockWithoutRespondentPhone: string = JSON.stringify(civilClaimResponseMock);
const mockWithoutRespondentPhone = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithoutRespondentPhone)),
};

describe('Repayment Plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
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
});

describe('on Post', () => {
  it('should return error when no input text is filled', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_YES_NO_OPTION);
      });
  });
  it('should return errors when "NO" option selected and telephone number is undefined ', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send({ option: 'no', telephoneNumber: ''})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(PHONE_NUMBER_REQUIRED);
      });
  });
  it('should return errors when "NO" option selected and telephone number max length is greater than 30 characters ', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send({ option: 'no', telephoneNumber: '1234567890123456789012345678900'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_TEXT_LENGTH);
      });
  });
  it('should redirect with valid input', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send({ option: 'no', telephoneNumber: '01632960001'})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
      });
  });
  it('should redirect with input option equal to "yes" ', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send({ option: 'yes', telephoneNumber: ''})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
      });
  });
  it('should return status 500 when there is error', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .post(CAN_WE_USE_URL)
      .send({ option: 'yes', telephoneNumber: ''})
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
        .send({ option: 'no', telephoneNumber: '01632960002'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
  });
});
