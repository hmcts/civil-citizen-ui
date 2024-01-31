import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {
  DQ_CONFIRM_YOUR_DETAILS_URL,
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Defendant yourself evidence Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return yourself evidence page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_GIVE_EVIDENCE_YOURSELF_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to give evidence yourself?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_GIVE_EVIDENCE_YOURSELF_URL)
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

    it('should return yourself evidence page', async () => {
      await request(app).post(DQ_GIVE_EVIDENCE_YOURSELF_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to give evidence yourself?');
      });
    });

    it('should redirect to the confirm your details evidence page if option yes is selected', async () => {
      await request(app).post(DQ_GIVE_EVIDENCE_YOURSELF_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_CONFIRM_YOUR_DETAILS_URL);
        });
    });

    it('should redirect to witnesses page if option no is selected', async () => {
      await request(app).post(DQ_GIVE_EVIDENCE_YOURSELF_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_DEFENDANT_WITNESSES_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_GIVE_EVIDENCE_YOURSELF_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
