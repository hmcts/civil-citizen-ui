import {Response} from 'express';
import {setCaseReferenceCookie, CASE_REFERENCE_COOKIE_NAME, syncCaseReferenceCookie, clearCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';
import {AppRequest, AppSession} from 'models/AppRequest';

describe('caseReferenceCookie middleware', () => {
  const maxAge = 1000;
  const middleware = setCaseReferenceCookie({secure: false, maxAge});

  const createResponse = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  }) as unknown as Response;

  const baseSession = {
    user: {
      accessToken: '',
      id: '',
      email: '',
      givenName: '',
      familyName: '',
      roles: [],
    },
    lang: undefined,
    previousUrl: '',
    claimId: '',
    taskLists: [],
    assignClaimURL: '',
    claimIssueTasklist: false,
    firstContact: {},
    fileUpload: '',
    issuedAt: 0,
    dashboard: {taskIdHearingUploadDocuments: ''},
    qmShareConfirmed: false,
  } as unknown as AppSession;

  const createRequest = (overrides: Partial<Omit<AppRequest, 'session'>> & {session?: Partial<AppSession>} = {}) => {
    const {session, ...rest} = overrides;
    return {
      session: {...baseSession, ...(session ?? {})} as AppSession,
      cookies: {},
      ...rest,
    } as AppRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets cookie when case reference stored in session', () => {
    const req = createRequest({session: {caseReference: '1645882162449409'}});
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      CASE_REFERENCE_COOKIE_NAME,
      '1645882162449409',
      expect.objectContaining({httpOnly: false, maxAge}),
    );
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('sets cookie from first contact details when session case reference missing', () => {
    const req = createRequest({session: {firstContact: {claimId: '1234567890123456'}}});
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      CASE_REFERENCE_COOKIE_NAME,
      '1234567890123456',
      expect.objectContaining({httpOnly: false, maxAge}),
    );
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('clears cookie when no case reference data present', () => {
    const req = createRequest({cookies: {[CASE_REFERENCE_COOKIE_NAME]: 'existing'}});
    const res = createResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith(
      CASE_REFERENCE_COOKIE_NAME,
      expect.objectContaining({sameSite: 'lax'}),
    );
    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('syncs cookie using provided response', () => {
    const res = createResponse();
    const req = createRequest({session: {caseReference: 'ABC123456789'}});

    syncCaseReferenceCookie(req, res as unknown as Response);

    expect(res.cookie).toHaveBeenCalledWith(
      CASE_REFERENCE_COOKIE_NAME,
      'ABC123456789',
      expect.objectContaining({httpOnly: false, maxAge}),
    );
  });

  it('clears cookie with override even when first contact present', () => {
    const res = createResponse();
    const req = createRequest({
      cookies: {[CASE_REFERENCE_COOKIE_NAME]: 'existing'},
      session: {firstContact: {claimId: '1234567890123456'}},
    });

    clearCaseReferenceCookie(req, res as unknown as Response);

    expect(res.clearCookie).toHaveBeenCalledWith(
      CASE_REFERENCE_COOKIE_NAME,
      expect.objectContaining({sameSite: 'lax'}),
    );
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
