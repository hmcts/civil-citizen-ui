import {Request, Response} from 'express';
import {Claim} from 'common/models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {breathingSpaceGuard} from 'routes/guards/breathingSpaceGuard';
import {BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL, DASHBOARD_URL} from 'routes/urls';

describe('breathingSpaceGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & {redirect: jest.Mock};
  let next: jest.Mock;
  beforeEach(() => {
    req = {params: {id: '123'}, url: BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL};
    res = {redirect: jest.fn()};
    next = jest.fn();
  });
  it('should redirect if breathingSpace type is provided', async () => {
    // Given
    const claim = {
      enterBreathing: {
        type: 'STANDARD',
      },
    } as Claim;
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);
    // When
    await breathingSpaceGuard(req as Request, res as Response, next);
    // Then
    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
  });
  it('should call next if breathingSpace type is undefined', async () => {
    // Given
    const claim = {
      enterBreathing: {
      },
    } as Claim;
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);
    // When
    await breathingSpaceGuard(req as Request, res as Response, next);
    // Then
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should call next if enterBreathing is undefined', async () => {
    // Given
    const claim = new Claim();
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);
    // When
    await breathingSpaceGuard(req as Request, res as Response, next);
    // Then
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should pass the error to next if there is an exception', async () => {
    // Given
    const error = new Error('Test error');
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockRejectedValueOnce(error);
    // When
    await breathingSpaceGuard(req as Request, res as Response, next);
    // Then
    expect(next).toHaveBeenCalledWith(error);
  });
});
