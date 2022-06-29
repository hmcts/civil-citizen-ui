import express from 'express';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  NO_LANGUAGE_ENTERED,
  NO_OTHER_SUPPORT,
  NO_SIGN_LANGUAGE_ENTERED,
  REDIS_FAILURE,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../../../../main/routes/urls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');


const supportRequiredUrl = SUPPORT_REQUIRED_URL.replace(':id', 'aaa');

describe('Support required', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    test('should return supportRequired page', async () => {
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Select any support you’d require for a court hearing (optional)');
        });
    });
    test('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(supportRequiredUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_FAILURE});
        });
    });
  });
  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    test('when languageSelected checked, and languageInterpreted provided, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'languageSelected',
          languageInterpreted: 'Croatian',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TASK_LIST_URL.replace(':id', 'aaa'));
        });
    });

    test('when signLanguageSelected checked, and signLanguageInterpreted provided, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'signLanguageSelected',
          signLanguageInterpreted: 'Sign',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TASK_LIST_URL.replace(':id', 'aaa'));
        });
    });

    test('when otherSupportSelected checked, and otherSupport provided, should redirect to claim task list screen', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'otherSupportSelected',
          otherSupport: 'Other',
        })
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TASK_LIST_URL.replace(':id', 'aaa'));
        });
    });


    test('should show error when languageSelected is checked and no languageInterpreted is provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'languageSelected',
          languageInterpreted: '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NO_LANGUAGE_ENTERED);
        });
    });

    test('should show error when signLanguageSelected is checked and no signLanguageInterpreted is provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'signLanguageSelected',
          signLanguageInterpreted: '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NO_SIGN_LANGUAGE_ENTERED);
        });
    });

    test('should show errors when languageSelected, signLanguageSelected and otherSupportSelected are checked but no information is provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: ['languageSelected', 'signLanguageSelected', 'otherSupportSelected'],
          languageInterpreted: '',
          signLanguageInterpreted: '',
          otherSupport: '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NO_SIGN_LANGUAGE_ENTERED);
          expect(res.text).toContain(NO_LANGUAGE_ENTERED);
          expect(res.text).toContain(NO_OTHER_SUPPORT);
        });
    });

    test('should show errors when otherSupportSelected is checked and no otherSupport is provided', async () => {
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'otherSupportSelected',
          otherSupport: '',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(NO_SIGN_LANGUAGE_ENTERED);
        });
    });

    test('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(supportRequiredUrl)
        .send({
          declared: 'languageSelected',
          languageInterpreted: 'Croatian',
        })
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_FAILURE});
        });
    });
  });
});
