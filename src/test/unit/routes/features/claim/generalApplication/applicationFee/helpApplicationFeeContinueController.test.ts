import {Response} from 'express';
import helpWithApplicationFeeContinueController from '../../../../../../../main/routes/features/generalApplication/applicationFee/helpWithApplicationFeeContinueController';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
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

describe('General Application - Do you want to continue to apply for Help with Fees', () => {
  const getHandler = getRouteHandler(helpWithApplicationFeeContinueController, 'get');
  const postHandler = getRouteHandler(helpWithApplicationFeeContinueController, 'post');
  const viewPath = 'features/generalApplication/applicationFee/help-with-application-fee-continue';
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
  const mockSaveDraft = saveDraftGAHWFDetails as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const redirectFor = (path: string): string =>
    constructResponseUrlWithIdAndAppIdParams(claimId, appId, path);

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
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the continue page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applyHelpWithFeeContinueContents: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the saved yes answer', async () => {
      const draft = new GaHelpWithFees();
      draft.helpWithFeesRequested = YesNo.YES;
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
    it('should redirect to the help with fees start page when the answer is yes', async () => {
      req.body = {option: YesNo.YES};
      req.query = {additionalFeeTypeFlag: 'false'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        redirectFor(GA_APPLY_HELP_WITH_FEES_START + '?additionalFeeTypeFlag=false'),
      );
    });

    it('should keep the additional fee flag when the answer is yes', async () => {
      req.body = {option: YesNo.YES};
      req.query = {additionalFeeTypeFlag: 'true'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        redirectFor(GA_APPLY_HELP_WITH_FEES_START + '?additionalFeeTypeFlag=true'),
      );
    });

    it('should redirect to fee selection when the answer is no', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(redirectFor(GA_APPLY_HELP_WITH_FEE_SELECTION));
    });

    it('should re-render when no answer is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraft.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
