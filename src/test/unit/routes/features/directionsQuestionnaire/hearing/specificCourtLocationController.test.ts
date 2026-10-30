import {Response} from 'express';
import specificCourtController from '../../../../../../main/routes/features/directionsQuestionnaire/hearing/specificCourtController';
import {DQ_WELSH_LANGUAGE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('client/civilServiceClient', () => ({
  CivilServiceClient: jest.fn().mockImplementation(() => ({
    getCourtLocations: jest.fn().mockResolvedValue([]),
  })),
}));

describe('specificCourtController test', () => {
  const getHandler = getRouteHandler(specificCourtController, 'get');
  const postHandler = getRouteHandler(specificCourtController, 'post');
  const viewPath = 'features/directionsQuestionnaire/hearing/specific-court';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the specific court page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        courtLocations: [],
        pageTitle: 'PAGES.SPECIFIC_COURT.PAGE_TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', ()=> {
    it('should re-render when the court and reason are missing', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        courtLocations: [],
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should show error message when court location is required but location is not selected and reason for court locaiton is not entered', async ()=>{
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.errorFor('courtLocation')).toBe('ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION');
      expect(form.errorFor('reason')).toBe('PAGES.SPECIFIC_COURT.REASON');
    });

    it('should show court location error when location is not selected but reason is entered', async ()=>{
      req.body = {courtLocation: '', reason: 'nearest location'};

      await postHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.errorFor('courtLocation')).toBe('ERRORS.SPECIFIC_COURT.SELECT_COURT_LOCATION');
      expect(form.hasFieldError('reason')).toBe(false);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should not show court location error when location is selected but reason is not entered', async ()=>{
      req.body = {courtLocation: 'courtLocation', reason: ''};

      await postHandler(req as never, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.hasFieldError('courtLocation')).toBe(false);
      expect(form.errorFor('reason')).toBe('PAGES.SPECIFIC_COURT.REASON');
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to the welsh language page when the court and reason are provided', async () => {
      req.body = {reason: 'reason', courtLocation: 'courtLocation'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {reason: 'reason', courtLocation: 'courtLocation'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
