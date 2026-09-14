import {Response} from 'express';
import yourDefenceController from '../../../../../main/routes/features/response/yourDefenceController';
import {CITIZEN_TIMELINE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {saveYourDefence} from 'services/features/response/yourDefenceService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/yourDefenceService', () => ({
  saveYourDefence: jest.fn(),
}));

describe('yourDefence', () => {
  const getHandler = getRouteHandler(yourDefenceController, 'get');
  const postHandler = getRouteHandler(yourDefenceController, 'post');
  const viewPath = 'features/response/your-defence';
  const claimId = '12345';
  const claimantName = 'Mr. Jan Clark';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockSaveYourDefence = saveYourDefence as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue(claimantName);
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockSaveYourDefence.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render yourDefence page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName,
      }));
    });

    it('should render yourDefence page when claim has additional data', async () => {
      const claim = stubClaim();
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName,
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no text is filled', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName,
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to timeline page when text is filled', async () => {
      req.body = {text: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveYourDefence).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    });

    it('should redirect to timeline page when text is filled and rejectAllOfClaim does not exist', async () => {
      mockGetCaseData.mockResolvedValue(stubClaim());
      req.body = {text: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveYourDefence.mockRejectedValue(error);
      req.body = {text: 'Test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
