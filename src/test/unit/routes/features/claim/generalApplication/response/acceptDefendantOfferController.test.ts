import {Response} from 'express';
import acceptDefendantOfferController from '../../../../../../../main/routes/features/generalApplication/response/acceptDefendantOfferController';
import {CASE_DOCUMENT_VIEW_URL, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {ProposedPaymentPlanOption} from 'models/generalApplication/response/acceptDefendantOffer';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - Accept defendant offer', () => {
  const getHandler = getRouteHandler(acceptDefendantOfferController, 'get');
  const postHandler = getRouteHandler(acceptDefendantOfferController, 'post');
  const viewPath = 'features/generalApplication/response/accept-defendant-offer';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGetDraft = gaStoreResponseService.getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraft = gaStoreResponseService.saveDraftGARespondentResponse as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const applicationResponse = {
    case_data: {
      generalAppN245FormUpload: {
        document_url: 'http://test',
        document_binary_url: 'http://test/binary',
        document_filename: 'test.png',
      },
    },
  } as unknown as ApplicationResponse;

  const n245 = CASE_DOCUMENT_VIEW_URL.replace(':id', appId).replace(':documentId', 'test');
  const redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT];
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
  });

  describe('on GET', () => {
    it('should render the accept defendant offer page with the N245 document', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({n245}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect when the offer is accepted', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.acceptDefendantOffer?.option).toBe(YesNo.YES);
      expect(mockSaveDraft).toHaveBeenCalledWith('ga-12345', gaResponse);
      expect(res.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it('should save instalments and redirect when the offer is rejected', async () => {
      req.body = {
        option: YesNo.NO,
        type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS,
        amountPerMonth: '10',
        reasonProposedInstalment: 'test',
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.acceptDefendantOffer?.type).toBe(ProposedPaymentPlanOption.ACCEPT_INSTALMENTS);
      expect(gaResponse.acceptDefendantOffer?.amountPerMonth).toBe('10');
      expect(res.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it('should save a set date and redirect when the offer is rejected', async () => {
      req.body = {
        option: YesNo.NO,
        type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE,
        day: '1',
        month: '1',
        year: '2040',
        reasonProposedSetDate: 'test',
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.acceptDefendantOffer?.type).toBe(ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE);
      expect(gaResponse.acceptDefendantOffer?.reasonProposedSetDate).toBe('test');
      expect(res.redirect).toHaveBeenCalledWith(redirectUrl);
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when no is selected without a payment type', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should re-render when instalments are selected without an amount or reason', async () => {
      req.body = {option: YesNo.NO, type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should re-render when a set date is selected without a date or reason', async () => {
      req.body = {option: YesNo.NO, type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
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
