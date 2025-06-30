import {Response, NextFunction} from 'express';
import {
  clearShareQuerySessionIfLeftJourney,
  shareQueryConfirmationGuard,
} from 'routes/guards/shareQueryConfirmationGuard';
import {AppRequest} from 'models/AppRequest';

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Share query confirmation guard', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to confirmation page, when not completed', async () => {
    const MOCK_REQUEST = {
      params: {id: '123'},
      originalUrl: '/test/test',
      session: {
        qmShareConfirmed: null,
      },
    } as unknown as AppRequest;
    shareQueryConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });

  it('should continue next, create query page, when confirmation completed', async () => {
    const MOCK_REQUEST = {
      params: {id: '123'},
      originalUrl: '/test/test',
      session: {
        qmShareConfirmed: true,
      },
    } as unknown as AppRequest;
    shareQueryConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

});

describe('Clear share query session if outside journey', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear session if not in journey', () => {
    const MOCK_REQUEST = {
      originalUrl: '/some/other/path',
      session: {
        qmShareConfirmed: true,
      },
    } as unknown as AppRequest;

    clearShareQuerySessionIfLeftJourney(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_REQUEST.session.qmShareConfirmed).toBeUndefined();
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should not clear session if in journey', () => {
    const MOCK_REQUEST = {
      originalUrl: '/some/path/create-query',
      session: {
        qmShareConfirmed: true,
      },
    } as unknown as AppRequest;

    clearShareQuerySessionIfLeftJourney(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_REQUEST.session.qmShareConfirmed).toBe(true);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
