import {Response} from 'express';
import {Claim} from 'common/models/claim';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {deleteGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import directionOrderSubmittedConfirmationController from '../../../../../../../main/routes/features/generalApplication/directionsOrderUpload/directionOrderSubmittedConfirmationController';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftGADocumentService', () => ({
  getGADocumentsFromDraftStore: jest.fn(),
  saveGADocumentsInDraftStore: jest.fn(),
  deleteGADocumentsFromDraftStore: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - directions order submitted confirmation', () => {
  const getHandler = getRouteHandler(directionOrderSubmittedConfirmationController, 'get');
  const viewPath = 'features/generalApplication/directionsOrderUpload/confirmation-screen';
  const claimId = '12345';
  const mockGetClaimById = getClaimById as jest.Mock;
  let req: {params: {id: string; appId: string}; query: Record<string, unknown>; cookies: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId: 'GA-1001'}, query: {}, cookies: {lang: 'en'}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-redis-key');
    (deleteGADocumentsFromDraftStore as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render the confirmation page and delete the draft documents', async () => {
    await getHandler(req as never, res as unknown as Response, next);

    expect(mockGetClaimById).toHaveBeenCalledWith(claimId, expect.anything(), true);
    expect(deleteGADocumentsFromDraftStore).toHaveBeenCalledWith('ga-redis-key');
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      confirmationTitle: 'PAGES.GENERAL_APPLICATION.UPLOAD_DIRECTIONS_ORDER_DOCUMENTS.CONFIRMATION_PAGE_TITLE',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);

    await getHandler(req as never, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
