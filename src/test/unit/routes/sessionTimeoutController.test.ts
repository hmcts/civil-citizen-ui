import config from 'config';
import {NextFunction, Response} from 'express';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../main/app';
import {SESSION_EXTEND_URL, SESSION_TIMEOUT_URL} from 'routes/urls';
import {t} from 'i18next';
import sessionTimeoutController from '../../../main/routes/sessionTimeoutController';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../main/modules/oidc');
jest.mock('../../../main/modules/draft-store');

describe('Session timeout', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('GET /session-timeout', () => {
    it('should display the session timeout page without the timeout warning', async () => {
      const res = await request(app).get(SESSION_TIMEOUT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.SESSION_TIMEOUT.TITLE'));
      expect(res.text).toContain(t('PAGES.SESSION_TIMEOUT.DESCRIPTION'));
      expect(res.text).not.toContain('data-module="govuk-timeout-warning"');
    });

    it('renders the timeout page when there is no session', () => {
      const req = {method: 'GET', url: SESSION_TIMEOUT_URL} as unknown as AppRequest;
      const render = jest.fn();
      const res = {
        locals: {user: {id: 'user-id'}, sessionTimeout: {}},
        render,
      };

      (sessionTimeoutController as unknown as {handle: (request: AppRequest, response: Response, next: NextFunction) => void})
        .handle(req, res as unknown as Response, jest.fn() as NextFunction);

      expect(res.locals.user).toBeUndefined();
      expect(res.locals.sessionTimeout).toBeUndefined();
      expect(render).toHaveBeenCalledWith('features/public/session-timeout', {
        pageTitle: 'PAGES.SESSION_TIMEOUT.PAGE_TITLE',
      });
    });
  });

  describe('GET /session/extend', () => {
    it('should return 401 when there is no authenticated session', async () => {
      const res = await request(app).post(SESSION_EXTEND_URL);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({extended: false});
    });

    it('should extend an authenticated session and touch it', () => {
      const touch = jest.fn();
      const save = jest.fn((callback: (error?: Error) => void) => callback());
      const expiresAt = Date.now() + 5400000;
      const req = {
        session: {
          user: {id: 'user-id'},
          touch,
          save,
          cookie: {
            expires: new Date(expiresAt),
            maxAge: 5400000,
          },
        },
        method: 'GET',
        url: SESSION_EXTEND_URL,
      } as unknown as AppRequest;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      (sessionTimeoutController as unknown as {handle: (request: AppRequest, response: Response, next: NextFunction) => void})
        .handle(req, res as unknown as Response, jest.fn() as NextFunction);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({extended: true, expiresAt});
      expect(req.session.sessionExtendedAt).toEqual(expect.any(Number));
      expect(touch).toHaveBeenCalledTimes(1);
      expect(save).toHaveBeenCalledTimes(1);
    });
  });
});
