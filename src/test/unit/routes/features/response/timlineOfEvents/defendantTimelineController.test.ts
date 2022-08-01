import config from 'config';
import nock from 'nock';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_EVIDENCE_URL, CITIZEN_TIMELINE_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  DATE_REQUIRED,
  DESCRIPTION_REQUIRED,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('defendant timeline controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    afterEach(() => {
      app.locals.draftStoreClient = undefined;
    });
    it('should display the page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_TIMELINE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Add your timeline of events');
          expect(res.text).toContain('Their timeline');
          expect(res.text).toContain('Add your timeline of events (optional)');
          expect(res.text).toContain('Add another event');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_TIMELINE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });
    afterEach(() => {
      app.locals.draftStoreClient = undefined;
    });
    it('should return error message when date is entered but no description', async () => {
      const data = {
        rows: [
          {
            date: '17 November 2021',
            description: '',
          },
        ],
      };
      await request(app)
        .post(CITIZEN_TIMELINE_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(DESCRIPTION_REQUIRED);
        });
    });
    it('should return error message when date is empty and description is defined', async () => {
      const data = {
        rows: [
          {
            date: '',
            description: 'something happened',
          },
        ],
      };
      await request(app)
        .post(CITIZEN_TIMELINE_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(DATE_REQUIRED);
        });
    });
    it('should redirect when no errors', async () => {
      const data = {
        rows: [
          {
            date: '17 November 2021',
            description: 'something happened',
          },
        ],
      };
      await request(app)
        .post(CITIZEN_TIMELINE_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toContain(CITIZEN_EVIDENCE_URL);
        });
    });
    it('should return http 500 on redis error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const data = {
        rows: [
          {
            date: '17 November 2021',
            description: 'something happened',
          },
        ],
      };
      await request(app)
        .post(CITIZEN_TIMELINE_URL)
        .send(data)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

