import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, VULNERABILITY_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Defendant expert can still examine Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return ask for a telephone or video hearing page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_PHONE_OR_VIDEO_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to ask for a telephone or video hearing?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_PHONE_OR_VIDEO_HEARING_URL)
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

    it('should return ask for a telephone or video hearing page', async () => {
      await request(app).post(DQ_PHONE_OR_VIDEO_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to ask for a telephone or video hearing?');
      });
    });

    it('should redirect to the vulnerability page if option yes is selected and reason is provided', async () => {
      await request(app).post(DQ_PHONE_OR_VIDEO_HEARING_URL)
        .send({option: 'yes', details: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(VULNERABILITY_URL);
        });
    });

    it('should redirect to vulnerability page if option no is selected', async () => {
      await request(app).post(DQ_PHONE_OR_VIDEO_HEARING_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(VULNERABILITY_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_PHONE_OR_VIDEO_HEARING_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
