import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/server';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, DQ_UNAVAILABLE_FOR_HEARING_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Why Unavailable for Hearing Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return why unavailable for hearing page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(DQ_UNAVAILABLE_FOR_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Why are you, your experts or witnesses unavailable for a hearing for ');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_UNAVAILABLE_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return why unavailable for hearing page', async () => {
      await request(app).post(DQ_UNAVAILABLE_FOR_HEARING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Why are you, your experts or witnesses unavailable for a hearing for ');
      });
    });

    it('should redirect to the phone or video hearing', async () => {
      await request(app).post(DQ_UNAVAILABLE_FOR_HEARING_URL).send({reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL);
        });
    });

    it('should show errors when reason not given', async () => {
      await request(app)
        .post(DQ_UNAVAILABLE_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.TELL_US_WHY_UNAVAILABLE'));
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_UNAVAILABLE_FOR_HEARING_URL)
        .send({reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
