import { Request, Response, NextFunction } from 'express';
import { restrictFormContentType } from 'modules/security/restrictFormContentType';

/** Mock req.get to satisfy Express overload (set-cookie returns string[], other headers string) */
const mockGet = (value: string | undefined): Request['get'] => jest.fn(() => value) as unknown as Request['get'];

describe('restrictFormContentType', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      get: jest.fn(),
    };
  });

  it('calls next() for GET requests', () => {
    req = { method: 'GET', path: '/case/123/general-application/order-judge', get: mockGet(undefined) };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for paths not in form-only list regardless of Content-Type', () => {
    req = {
      method: 'POST',
      path: '/case/123/dashboard',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 415 for POST to GA path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/order-judge',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.send).toHaveBeenCalledWith('Unsupported Media Type');
  });

  it('returns 415 for POST to GA path with no Content-Type', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/order-judge',
      get: mockGet(undefined),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('calls next() for POST to GA path with application/x-www-form-urlencoded', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/order-judge',
      get: mockGet('application/x-www-form-urlencoded'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for POST to GA path with multipart/form-data', () => {
    req = {
      method: 'POST',
      path: '/case/123/general-application/upload-documents',
      get: mockGet('multipart/form-data; boundary=----'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 415 for POST to response GA path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/response/general-application/456/agree-to-order',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to claim path with application/json', () => {
    req = {
      method: 'POST',
      path: '/claim/claimant-individual-details',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to qm path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/qm/create-query',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('calls next() for POST to claim path with application/x-www-form-urlencoded', () => {
    req = {
      method: 'POST',
      path: '/claim/claimant-individual-details',
      get: mockGet('application/x-www-form-urlencoded'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for POST to qm path with multipart/form-data', () => {
    req = {
      method: 'POST',
      path: '/case/123/qm/create-query',
      get: mockGet('multipart/form-data; boundary=----'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('calls next() for PUT to GA path with form content type', () => {
    req = {
      method: 'PUT',
      path: '/case/123/general-application/some-path',
      get: mockGet('application/x-www-form-urlencoded'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 415 for PATCH to GA path with application/json', () => {
    req = {
      method: 'PATCH',
      path: '/case/123/general-application/some-path',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to directions-questionnaire path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/directions-questionnaire/court-location',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to statement-of-means path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/response/statement-of-means/employment/employers',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to statement-of-means court-orders with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/response/statement-of-means/court-orders',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to response timeline path with application/json', () => {
    req = {
      method: 'POST',
      path: '/case/123/response/timeline',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to claim timeline with application/json', () => {
    req = {
      method: 'POST',
      path: '/claim/timeline',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });

  it('returns 415 for POST to claim interest-rate with application/json', () => {
    req = {
      method: 'POST',
      path: '/claim/interest-rate',
      get: mockGet('application/json'),
    };
    restrictFormContentType(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
  });
});
