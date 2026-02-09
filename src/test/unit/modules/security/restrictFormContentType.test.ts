import { Request, Response } from 'express';
import { restrictFormContentType } from 'modules/security/restrictFormContentType';

describe('restrictFormContentType', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('calls next() for GET requests', () => {
    req = { method: 'GET', path: '/case/123/general-application/order-judge', headers: {} };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for POST to non-GA paths', () => {
    req = { method: 'POST', path: '/dashboard', headers: { 'content-type': 'application/json' } };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 415 for POST with application/json to GA form path', () => {
    req = {
      method: 'POST',
      path: '/case/1645882162449409/general-application/order-judge',
      headers: { 'content-type': 'application/json' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.send).toHaveBeenCalledWith('Unsupported Media Type');
  });

  /**
   * Mirrors pentest (DTSCCI-2852): same payload as HTML in body sent as application/json
   * must be rejected with 415 so WAF bypass via JSON is not possible at app layer.
   * URL-encoded submission is still subject to WAF (403 when malicious).
   */
  it('returns 415 for POST with application/json and HTML-in-text payload (WAF bypass scenario)', () => {
    req = {
      method: 'POST',
      path: '/case/1645882162449409/general-application/order-judge',
      headers: { 'content-type': 'application/json' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST with text/plain to GA form path', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/requesting-reason',
      headers: { 'content-type': 'text/plain' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('calls next() for POST with application/x-www-form-urlencoded to GA form path', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/order-judge',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for POST with multipart/form-data to GA path (file upload)', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/123/upload-documents',
      headers: { 'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 415 for POST with application/json to GA response form path', () => {
    req = {
      method: 'POST',
      path: '/case/123/response/general-application/456/agree-to-order',
      headers: { 'content-type': 'application/json' },
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });
});
