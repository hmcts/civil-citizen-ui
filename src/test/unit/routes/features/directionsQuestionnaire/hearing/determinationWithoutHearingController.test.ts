import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/server';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {DETERMINATION_WITHOUT_HEARING_URL, DQ_EXPERT_SMALL_CLAIMS_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Determination Without Hearing Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return determination without hearing page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DETERMINATION_WITHOUT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Determination without Hearing Questions');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DETERMINATION_WITHOUT_HEARING_URL)
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

    it('should return determination without hearing page', async () => {
      await request(app).post(DETERMINATION_WITHOUT_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Determination without Hearing Questions');
      });
    });

    it('should return determination without hearing page if only option no is selected', async () => {
      await request(app).post(DETERMINATION_WITHOUT_HEARING_URL).send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Determination without Hearing Questions');
        });
    });

    it('should return determination without hearing page if only option reason is provided', async () => {
      await request(app).post(DETERMINATION_WITHOUT_HEARING_URL).send({reasonForHearing: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Determination without Hearing Questions');
        });
    });

    it('should redirect to the support required page if option yes is selected', async () => {
      await request(app).post(DETERMINATION_WITHOUT_HEARING_URL).send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_SMALL_CLAIMS_URL);
        });
    });

    it('should redirect to the support required page if option no is selected and reason is provided', async () => {
      await request(app).post(DETERMINATION_WITHOUT_HEARING_URL)
        .send({option: YesNo.NO, reasonForHearing: 'valid reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_EXPERT_SMALL_CLAIMS_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DETERMINATION_WITHOUT_HEARING_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
