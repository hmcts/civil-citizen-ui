import {Request, Response} from 'express';
import rejectAllOfClaimController from '../../../../../main/routes/features/response/rejectAllOfClaimController';
import {RESPONSE_TASK_LIST_URL, SEND_RESPONSE_BY_EMAIL_URL} from 'routes/urls';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import * as rejectAllOfClaimService from 'services/features/response/rejectAllOfClaimService';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/rejectAllOfClaimService');

describe('rejectAllOfClaim', () => {
  const getHandler = getRouteHandler(rejectAllOfClaimController, 'get');
  const postHandler = getRouteHandler(rejectAllOfClaimController, 'post');
  const viewPath = 'features/response/reject-all-of-claim';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockGetRejectAllOfClaim = rejectAllOfClaimService.getRejectAllOfClaim as jest.Mock;
  const mockSaveRejectAllOfClaim = rejectAllOfClaimService.saveRejectAllOfClaim as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Mr. Jan Clark');
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetResponseClaimById.mockResolvedValue(stubClaim());
    mockGetRejectAllOfClaim.mockResolvedValue({option: undefined});
    mockSaveRejectAllOfClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the reject all of claim page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        rejectAllOfClaimType: RejectAllOfClaimType,
        claimantName: 'Mr. Jan Clark',
      }));
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(mockGetRejectAllOfClaim).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: 'Mr. Jan Clark',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveRejectAllOfClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when DISPUTE is selected', async () => {
      req.body = {option: RejectAllOfClaimType.DISPUTE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveRejectAllOfClaim).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          option: RejectAllOfClaimType.DISPUTE,
          whyDoYouDisagree: expect.any(WhyDoYouDisagree),
          howMuchHaveYouPaid: expect.any(HowMuchHaveYouPaid),
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save and redirect to the task list when ALREADY_PAID is selected', async () => {
      req.body = {option: RejectAllOfClaimType.ALREADY_PAID};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveRejectAllOfClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to send response by email when COUNTER_CLAIM is selected', async () => {
      req.body = {option: RejectAllOfClaimType.COUNTER_CLAIM};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, SEND_RESPONSE_BY_EMAIL_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveRejectAllOfClaim.mockRejectedValue(error);
      req.body = {option: RejectAllOfClaimType.ALREADY_PAID};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
