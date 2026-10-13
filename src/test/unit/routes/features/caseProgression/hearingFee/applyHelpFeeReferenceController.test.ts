import {Request, Response} from 'express';
import applyHelpFeeReferenceController from '../../../../../../main/routes/features/caseProgression/hearingFee/applyHelpFeeReferenceController';
import {HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_CONFIRMATION_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {triggerNotifyEvent} from 'services/features/caseProgression/hearingFee/hearingFeeService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/caseProgression/hearingFee/hearingFeeService', () => ({
  triggerNotifyEvent: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents', () => ({
  getApplyHelpFeeReferenceContents: jest.fn((): unknown[] => []),
}));
jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents', () => ({
  getButtonsContents: jest.fn((): unknown[] => []),
}));

describe('Apply help fees reference', () => {
  const getHandler = getRouteHandler(applyHelpFeeReferenceController, 'get');
  const postHandler = getRouteHandler(applyHelpFeeReferenceController, 'post');
  const viewPath = 'features/caseProgression/hearingFee/apply-help-fee-reference';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    mockGetClaimById.mockResolvedValue(claim);
    jest.clearAllMocks();
    mockGetClaimById.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the help with fees reference page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to fee selection when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(saveCaseProgression).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION));
    });

    it('should notify and redirect to confirmation when yes is selected with a reference', async () => {
      req.body = {option: YesNo.YES, referenceNumber: 'ABC11ACB112'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(triggerNotifyEvent).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, HEARING_FEE_CONFIRMATION_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      (saveCaseProgression as jest.Mock).mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
