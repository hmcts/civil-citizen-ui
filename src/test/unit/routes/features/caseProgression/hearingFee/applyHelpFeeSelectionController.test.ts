import {Request, Response} from 'express';
import applyHelpFeeSelectionController from '../../../../../../main/routes/features/caseProgression/hearingFee/applyHelpFeeSelectionController';
import {APPLY_HELP_WITH_FEES} from 'routes/urls';
import {YesNo} from 'form/models/yesNo';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {getClaimById, refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionService');
jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents', () => ({
  getApplyHelpFeeSelectionContents: jest.fn(() => []),
}));
jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents', () => ({
  getButtonsContents: jest.fn(() => []),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  refreshDraftStoreClaimFrom: jest.fn(),
}));

describe('Apply help fee selection', () => {
  const getHandler = getRouteHandler(applyHelpFeeSelectionController, 'get');
  const postHandler = getRouteHandler(applyHelpFeeSelectionController, 'post');
  const viewPath = 'features/caseProgression/hearingFee/apply-help-fee-selection';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockRefresh = refreshDraftStoreClaimFrom as jest.Mock;

  const hearingClaim = (): Claim => {
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    claim.caseProgressionHearing = {hearingFeeInformation: {hearingFee: {calculatedAmountInPence: '1000'}}} as Claim['caseProgressionHearing'];
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(hearingClaim());
    mockRefresh.mockResolvedValue(hearingClaim());
  });

  describe('on GET', () => {
    it('should render the apply help fee selection page', async () => {
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

    it('should redirect using the service URL when no is selected', async () => {
      (getRedirectUrl as jest.Mock).mockResolvedValue('https://card.payments.service.gov.uk/secure/abc');
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith('https://card.payments.service.gov.uk/secure/abc');
    });

    it('should redirect to apply help with fees when yes is selected', async () => {
      (getRedirectUrl as jest.Mock).mockResolvedValue(APPLY_HELP_WITH_FEES);
      req.body = {option: YesNo.YES};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(APPLY_HELP_WITH_FEES);
    });
  });
});
