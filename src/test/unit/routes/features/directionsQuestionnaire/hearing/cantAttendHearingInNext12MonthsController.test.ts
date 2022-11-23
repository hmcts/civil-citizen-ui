import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, UNAUTHORISED_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('.modules/oidc');
jest.mock('.modules/draft-store');

describe('cant attend hearing in next months Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return cant attend hearing in next months page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Are there any dates in the next 12 months when you, your experts or witnesses cannot go to a hearing?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return cant attend hearing in next months page on empty post', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_NEXT_12MONTHS_CANNOT_HEARING);
      });
    });

    it('should redirect to _____________ page if option yes is selected', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(UNAUTHORISED_URL);
        });
    });

    it('should redirect to __________________ page page if option no is selected', async () => {
      await request(app).post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(UNAUTHORISED_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
