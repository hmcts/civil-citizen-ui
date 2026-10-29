import {Response} from 'express';
import helpWithApplicationFeeReferenceController from '../../../../../../../main/routes/features/generalApplication/applicationFee/helpWithApplicationFeeReferenceController';
import {
  GA_APPLICATION_FEE_CONFIRMATION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
} from 'routes/urls';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
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
jest.mock('services/features/generalApplication/applicationFee/generalApplicationFeePaymentService', () => ({
  triggerNotifyHwfEvent: jest.fn().mockResolvedValue(undefined),
}));

describe('General Application - Do you have a help with fees reference number', () => {
  const getHandler = getRouteHandler(helpWithApplicationFeeReferenceController, 'get');
  const postHandler = getRouteHandler(helpWithApplicationFeeReferenceController, 'post');
  const viewPath = 'features/generalApplication/applicationFee/help-with-application-fee-reference';
  const claimId = '12345';
  const appId = '67890';
  const referenceNumber = 'HWF-123-86D';
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
    it('should render the reference number page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applyHelpWithFeeReferenceContents: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render a saved reference number', async () => {
      const draft = new GaHelpWithFees();
      draft.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, referenceNumber);
      mockGetDraft.mockResolvedValue(draft);

      await getHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.referenceNumber).toBe(referenceNumber);
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
    it('should redirect to fee selection when the answer is no', async () => {
      req.query = {additionalFeeTypeFlag: 'false'};
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        redirectFor(GA_APPLY_HELP_WITH_FEE_SELECTION + '?additionalFeeTypeFlag=false'),
      );
    });

    it('should redirect to the application fee confirmation page when a reference is given', async () => {
      req.query = {additionalFeeTypeFlag: 'false'};
      req.body = {option: YesNo.YES, referenceNumber};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        redirectFor(GA_APPLICATION_FEE_CONFIRMATION_URL + '?additionalFeeTypeFlag=false'),
      );
    });

    it('should keep the additional fee flag when a reference is given', async () => {
      req.query = {additionalFeeTypeFlag: 'true'};
      req.body = {option: YesNo.YES, referenceNumber};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        redirectFor(GA_APPLICATION_FEE_CONFIRMATION_URL + '?additionalFeeTypeFlag=true'),
      );
    });

    it('should re-render when an additional fee reference is missing', async () => {
      req.query = {additionalFeeTypeFlag: 'true'};
      req.body = {option: YesNo.YES, referenceNumber: ''};

      await postHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.hasErrors()).toBe(true);
      expect(JSON.stringify(form.errors)).toContain('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.VALID_ENTER_REFERENCE_NUMBER');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when an application fee reference is missing', async () => {
      req.query = {additionalFeeTypeFlag: 'false'};
      req.body = {option: YesNo.YES, referenceNumber: ''};

      await postHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.hasErrors()).toBe(true);
      expect(JSON.stringify(form.errors)).toContain('ERRORS.VALID_ENTER_REFERENCE_NUMBER_GA_HWF');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when no answer is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraft.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
