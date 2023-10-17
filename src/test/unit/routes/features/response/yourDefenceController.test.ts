import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_TIMELINE_URL, RESPONSE_YOUR_DEFENCE_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUnemploymentRetired,
  mockNoStatementOfMeans,
  mockRedisFailure,
  mockRedisFullAdmission,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('yourDefence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    const inset = 'Your response will be sent to Mr. Jan Clark.';
    const header = 'Why do you disagree with the claim?';

    it('should return yourDefence page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(RESPONSE_YOUR_DEFENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(header);
          expect(res.text).toContain(inset);
        });
    });

    it('should return yourDefence page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimUnemploymentRetired;
      await request(app).get(RESPONSE_YOUR_DEFENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(header);
          expect(res.text).toContain(inset);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(RESPONSE_YOUR_DEFENCE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return error message when any text is filled', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(RESPONSE_YOUR_DEFENCE_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You need to explain why you don&#39;t owe the money');
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should redirect to timeline page option text is fill', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).post(RESPONSE_YOUR_DEFENCE_URL)
        .send({text: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_TIMELINE_URL);
        });
    });

    it('should redirect to timeline page option text is fill and rejectAllOfClaim no exist', async () => {
      app.locals.draftStoreClient = mockRedisFullAdmission;
      await request(app).post(RESPONSE_YOUR_DEFENCE_URL)
        .send({text: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_TIMELINE_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(RESPONSE_YOUR_DEFENCE_URL)
        .send({text: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
