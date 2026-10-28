import {Response} from 'express';
import payAdditionalFeeController from '../../../../../../../main/routes/features/generalApplication/additionalFee/payAdditionalFeeController';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn(),
  saveDraftGAHWFDetails: jest.fn(),
}));
jest.mock('services/features/generalApplication/fee/helpWithFeeService', () => ({
  getRedirectUrl: jest.fn(),
}));

describe('General Application - Pay additional fee Page', () => {
  const getHandler = getRouteHandler(payAdditionalFeeController, 'get');
  const postHandler = getRouteHandler(payAdditionalFeeController, 'post');
  const viewPath = 'features/generalApplication/additionalFee/help-with-additional-fee';
  const claimId = '12345';
  const appId = '67890';
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDraft = getDraftGAHWFDetails as jest.Mock;
  const mockGetRedirectUrl = getRedirectUrl as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue(appId);
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
    mockGetDraft.mockImplementation(async () => new GaHelpWithFees());
    mockGetRedirectUrl.mockResolvedValue('test');
  });

  describe('on GET', () => {
    it('should render the additional help with fees page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applyHelpWithFeeSelectionContents: expect.any(Array),
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].applyHelpWithFeeSelectionContents))
        .toContain('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.WANT_TO_APPLY_HWF_TITLE');
      expect(next).not.toHaveBeenCalled();
    });

    it('should render a previously selected yes answer', async () => {
      const draft = new GaHelpWithFees();
      draft.applyAdditionalHelpWithFees = new GenericYesNo(YesNo.YES);
      mockGetDraft.mockResolvedValue(draft);

      await getHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.YES);
    });

    it('should call next when loading the draft fails', async () => {
      const error = new Error('redis failure');
      mockGetDraft.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the url returned for a yes answer', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith('test');
    });

    it('should re-render when no answer is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockGetRedirectUrl).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when the redirect lookup fails', async () => {
      const error = new Error('redis failure');
      mockGetRedirectUrl.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
