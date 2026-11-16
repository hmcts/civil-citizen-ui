import {createHash} from 'crypto';
import {Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {ASSIGN_CLAIM_URL, CLAIMANT_TASK_LIST_URL, DASHBOARD_URL, SIGN_IN_URL, UNAUTHORISED_URL} from 'routes/urls';

type GrantOutcome = 'accepted' | 'invalid_grant' | 'failed';
type Log = (message: string, details: Record<string, unknown>) => void;

const fingerprint = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0
    ? createHash('sha256').update(value).digest('hex')
    : undefined;

const headerCategory = (value: unknown, allowed: string[]): string =>
  typeof value !== 'string' ? 'absent' : allowed.includes(value) ? value : 'other';

export const recordCallbackDiagnostics = (req: AppRequest, res: Response, log: Log): ((outcome: GrantOutcome) => void) => {
  const started = Date.now();
  let grantOutcome: GrantOutcome | 'pending' = 'pending';
  const requestDetails = {
    codeFingerprint: fingerprint(req.query.code),
    sessionFingerprint: fingerprint(req.sessionID),
    // Front Door can generate internal references too. Different fingerprints
    // alone do not prove that the browser initiated separate navigations.
    frontDoorFingerprint: fingerprint(req.headers['x-azure-ref']),
    fetchDestination: headerCategory(req.headers['sec-fetch-dest'], ['document', 'iframe', 'image', 'script', 'empty']),
    fetchMode: headerCategory(req.headers['sec-fetch-mode'], ['navigate', 'cors', 'no-cors', 'same-origin']),
    fetchSite: headerCategory(req.headers['sec-fetch-site'], ['same-origin', 'same-site', 'cross-site', 'none']),
    userActivated: req.headers['sec-fetch-user'] === '?1',
    prefetch: [req.headers['purpose'], req.headers['sec-purpose']]
      .some(value => typeof value === 'string' && value.includes('prefetch')),
    authenticatedAtStart: Boolean(req.session?.user?.accessToken),
  };

  res.once('close', () => log('IDAM callback outcome', {
    ...requestDetails,
    grantOutcome,
    responseStatus: res.statusCode,
    redirectDestination: headerCategory(res.getHeader('location'), [
      ASSIGN_CLAIM_URL, CLAIMANT_TASK_LIST_URL, DASHBOARD_URL, SIGN_IN_URL, UNAUTHORISED_URL,
    ]),
    responseCompleted: res.writableFinished,
    durationMs: Date.now() - started,
    authenticatedAtClose: Boolean(req.session?.user?.accessToken),
  }));

  return outcome => { grantOutcome = outcome; };
};
