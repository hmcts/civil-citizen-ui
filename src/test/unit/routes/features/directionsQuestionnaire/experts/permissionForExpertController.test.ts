import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  DQ_EXPERT_CAN_STILL_EXAMINE_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  PERMISSION_FOR_EXPERT_URL,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Permission For Expert Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return permission for expert page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(PERMISSION_FOR_EXPERT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to ask for the court’s permission to use an expert?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(PERMISSION_FOR_EXPERT_URL)
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

    it('should return permission for expert page on empty post', async () => {
      await request(app).post(PERMISSION_FOR_EXPERT_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.PERMISSION_FOR_EXPERT_REQUIRED'));
      });
    });

    it('should redirect to the expert can still examine page if option yes is selected', async () => {
      await request(app).post(PERMISSION_FOR_EXPERT_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_CAN_STILL_EXAMINE_URL);
        });
    });

    it('should redirect to the give evidence yourself page if option no is selected', async () => {
      await request(app).post(PERMISSION_FOR_EXPERT_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_GIVE_EVIDENCE_YOURSELF_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(PERMISSION_FOR_EXPERT_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
