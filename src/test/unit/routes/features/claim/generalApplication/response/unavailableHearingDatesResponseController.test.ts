import {Response} from 'express';
import unavailableHearingDatesResponseController from '../../../../../../../main/routes/features/generalApplication/response/unavailableHearingDatesResponseController';
import {GA_RESPONSE_HEARING_SUPPORT_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {UnavailableDateType} from 'models/generalApplication/unavailableDatesGaHearing';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application Response - Unavailable hearing dates', () => {
  const getHandler = getRouteHandler(unavailableHearingDatesResponseController, 'get');
  const postHandler = getRouteHandler(unavailableHearingDatesResponseController, 'post');
  const viewPath = 'features/generalApplication/unavailable-dates-hearing';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetClaim = getClaimById as jest.Mock;
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

  const futureDate = (): {day: string; month: string; year: string} => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return {
      day: String(date.getDate()),
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear()),
    };
  };

  const singleDateItem = (start: {day?: string; month?: string; year?: string}) => ({
    type: UnavailableDateType.SINGLE_DATE,
    single: {start},
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the unavailable dates page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the response fails', async () => {
      const error = new Error('redis failure');
      mockGetDraft.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect when a single date is provided', async () => {
      req.body = {items: [singleDateItem(futureDate())]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.unavailableDatesHearing?.items).toHaveLength(1);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_HEARING_SUPPORT_URL),
      );
    });

    it('should re-render when no date type is selected', async () => {
      req.body = {items: [{}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should re-render with an extra row when add another is selected', async () => {
      req.body = {action: 'add_another-unavailableDates', items: [singleDateItem(futureDate())]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.items).toHaveLength(2);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render without the removed date', async () => {
      req.body = {action: 'remove-unavailableDates', items: [singleDateItem(futureDate())]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.items).toHaveLength(0);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when the single date is incomplete', async () => {
      const {month, year} = futureDate();
      req.body = {items: [singleDateItem({month, year})]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should call next when loading the response fails', async () => {
      const error = new Error('redis failure');
      mockGetDraft.mockRejectedValue(error);

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
