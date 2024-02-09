import {Request, Response} from 'express';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_CONFIRMATION_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {claimantResponseConfirmationGuard} from 'routes/guards/claimantResponseConfirmationGuard';
import {CivilServiceClient} from 'client/civilServiceClient';

describe('claimantResponseConfirmationGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & { redirect: jest.Mock };
  let next: jest.Mock;
  beforeEach(() => {
    req = {params: {id: '123'}, url: CLAIMANT_RESPONSE_CONFIRMATION_URL };
    res = { redirect: jest.fn() };
    next = jest.fn();
  });
  it('should call next if claimantResponseConfirmationGuard returns false', async () => {
    // Given
    const claim = {
      isClaimantIntentionPending: jest.fn().mockReturnValue(false),
    } as unknown as Claim;
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);
    // When
    await claimantResponseConfirmationGuard(req as Request, res as Response, next);
    // Then
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should redirect if claimantResponseConfirmationGuard returns true', async () => {
    // Given
    req = {params: {id: '123'}, originalUrl: '' };
    const claim = {
      isClaimantIntentionPending: jest.fn().mockReturnValue(true),
    } as unknown as Claim;
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);
    const redirectUrl = constructResponseUrlWithIdParams(
      req.params.id,
      CLAIMANT_RESPONSE_TASK_LIST_URL,
    );
    // When
    await claimantResponseConfirmationGuard(req as Request, res as Response, next);
    // Then
    expect(res.redirect).toHaveBeenCalledWith(redirectUrl);
  });
  it('should pass the error to next if there is an exception', async () => {
    // Given
    const error = new Error('Test error');
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockRejectedValueOnce(error);
    // When
    await claimantResponseConfirmationGuard(req as Request, res as Response, next);
    // Then
    expect(next).toHaveBeenCalledWith(error);
  });
});
