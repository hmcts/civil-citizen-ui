import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, Response } from 'express';
import { deleteGAGuard } from 'routes/guards/deleteGAGuard';
import { deleteGAFromClaimsByUserId } from 'services/features/generalApplication/generalApplicationService';

jest.mock('../../../../main/services/features/generalApplication/generalApplicationService', () => ({
  deleteGAFromClaimsByUserId: jest.fn(),
}));

describe('deleteGAGuard', () => {
  const userId = '12345';

  const MOCK_REQUEST = { 
    params: { id: '123' },
    session: {
      user: { id: userId },
    }
  } as unknown as AppRequest;
  const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
  const MOCK_NEXT = jest.fn() as NextFunction;

  it('should call deleteGAFromClaimsByUserId with the correct user id and call next()', async () => {
    // Given
    const deleteGAFromClaimsByUserIdMock = deleteGAFromClaimsByUserId as jest.Mock;
    // When
    await deleteGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    // Then
    expect(deleteGAFromClaimsByUserIdMock).toHaveBeenCalledWith(userId);
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_NEXT).not.toHaveBeenCalledWith(expect.any(Error));
  });
  it('should call next with an error if deleteGAFromClaimsByUserId throws an error', async () => {
    // Given
    const error = new Error('Something went wrong');
    const deleteGAFromClaimsByUserIdMock = deleteGAFromClaimsByUserId as jest.Mock;
    deleteGAFromClaimsByUserIdMock.mockRejectedValueOnce(error);
    // When
    await deleteGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    // Then
    expect(deleteGAFromClaimsByUserIdMock).toHaveBeenCalledWith(userId);
    expect(MOCK_NEXT).toHaveBeenCalledWith(error); 
  });
});
