import {EventEmitter} from 'events';
import {Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {recordCallbackDiagnostics} from 'modules/oidc/callbackDiagnostics';
import {DASHBOARD_URL} from 'routes/urls';

const createRequest = (sessionID = 'private-session-id') => ({
  query: {code: 'private-authorisation-code'},
  sessionID,
  headers: {
    'x-azure-ref': 'private-front-door-reference',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-user': '?1',
    cookie: 'private-cookie',
    authorization: 'private-authorization-header',
  },
  session: {user: {accessToken: 'private-access-token', idToken: 'private-id-token'}},
}) as unknown as AppRequest;

const createResponse = (completed = true, location = DASHBOARD_URL) => Object.assign(new EventEmitter(), {
  statusCode: 302,
  writableFinished: completed,
  getHeader: jest.fn().mockReturnValue(location),
});

describe('callback diagnostics', () => {
  it('records completion with comparable fingerprints without exporting credentials', () => {
    const req = createRequest();
    const res = createResponse();
    const log = jest.fn();
    const recordGrant = recordCallbackDiagnostics(req, res as unknown as Response, log);
    recordGrant('accepted');
    expect(log).not.toHaveBeenCalled();

    res.emit('close');
    res.emit('close');

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][1]).toMatchObject({
      codeFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      sessionFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      frontDoorFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      fetchDestination: 'document', fetchMode: 'navigate', fetchSite: 'cross-site',
      userActivated: true, prefetch: false, authenticatedAtStart: true,
      grantOutcome: 'accepted', responseStatus: 302, responseCompleted: true,
      redirectDestination: DASHBOARD_URL, authenticatedAtClose: true,
    });
    const output = JSON.stringify(log.mock.calls);
    for (const secret of [
      req.query.code, req.sessionID, req.headers['x-azure-ref'], req.headers.cookie,
      req.headers.authorization, req.session.user.accessToken, req.session.user.idToken,
    ]) {
      expect(output).not.toContain(secret);
    }
  });

  it('correlates a repeated code across different sessions', () => {
    const log = jest.fn();
    for (const sessionID of ['first-private-session', 'second-private-session']) {
      const res = createResponse();
      const recordGrant = recordCallbackDiagnostics(createRequest(sessionID), res as unknown as Response, log);
      recordGrant(sessionID.startsWith('first') ? 'accepted' : 'invalid_grant');
      res.emit('close');
    }
    const first = log.mock.calls[0][1];
    const second = log.mock.calls[1][1];
    expect(first.codeFingerprint).toBe(second.codeFingerprint);
    expect(first.sessionFingerprint).not.toBe(second.sessionFingerprint);
    expect(second.grantOutcome).toBe('invalid_grant');
  });

  it('identifies a connection closed before the exchange and response completed', () => {
    const res = createResponse(false);
    const log = jest.fn();
    recordCallbackDiagnostics(createRequest(), res as unknown as Response, log);
    res.emit('close');
    expect(log.mock.calls[0][1]).toMatchObject({grantOutcome: 'pending', responseCompleted: false});
  });

  it('keeps unexpected header values and payment destinations out of logs', () => {
    const req = createRequest();
    req.headers['sec-fetch-dest'] = 'private-unexpected-header';
    req.headers['sec-purpose'] = 'prefetch;prerender';
    delete req.headers['x-azure-ref'];
    const res = createResponse(true, '/payment-return/private-case-id?token=private-payment-token');
    const log = jest.fn();
    const recordGrant = recordCallbackDiagnostics(req, res as unknown as Response, log);
    recordGrant('failed');
    res.emit('close');
    expect(log.mock.calls[0][1]).toMatchObject({
      fetchDestination: 'other', prefetch: true, redirectDestination: 'other', grantOutcome: 'failed',
    });
    expect(log.mock.calls[0][1].frontDoorFingerprint).toBeUndefined();
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/private-unexpected-header|private-case-id|private-payment-token/);
  });

  it('records absent correlation metadata without assuming an authenticated session', () => {
    const req = {query: {code: ''}, sessionID: '', headers: {}, session: {}} as unknown as AppRequest;
    const res = createResponse();
    const log = jest.fn();
    recordCallbackDiagnostics(req, res as unknown as Response, log);
    res.emit('close');
    expect(log.mock.calls[0][1]).toMatchObject({
      codeFingerprint: undefined, sessionFingerprint: undefined, frontDoorFingerprint: undefined,
      fetchDestination: 'absent', fetchMode: 'absent', fetchSite: 'absent',
      authenticatedAtStart: false, authenticatedAtClose: false, prefetch: false, userActivated: false,
    });
  });
});
