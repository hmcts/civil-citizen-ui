import {Response} from 'express';
import agreedResponseDeadlineController from '../../../../../../main/routes/features/response/responseDeadline/agreedResponseDeadlineController';
import {NEW_RESPONSE_DEADLINE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {PartyType} from 'models/partyType';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));

describe('Agreed response date', () => {
  const getHandler = getRouteHandler(agreedResponseDeadlineController, 'get');
  const postHandler = getRouteHandler(agreedResponseDeadlineController, 'post');
  const viewPath = 'features/response/responseDeadline/agreed-response-deadline';
  const claimId = 'claim-id';
  const originalResponseDeadline = new Date('2050-05-15T02:59:59');
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;

  const buildClaim = (agreedResponseDeadline?: Date): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {
        partyName: 'Joe Bloggs',
      },
    };
    claim.respondent1ResponseDeadline = originalResponseDeadline;
    if (agreedResponseDeadline) {
      claim.responseDeadline = {agreedResponseDeadline};
    }
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Joe Bloggs');
    return claim;
  };

  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;

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
    mockGetStashedClaim.mockReset();
    mockGetStashedClaim.mockResolvedValue(buildClaim());
    jest.spyOn(ResponseDeadlineService.prototype, 'saveAgreedResponseDeadline').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call getStashedClaimOrFromStore only once per GET request', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should render agreed response date page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName: 'Joe Bloggs',
        today: expect.any(Date),
        isReleaseTwoEnabled: true,
      }));
    });

    it('should render agreed response date with payment date loaded from store', async () => {
      mockGetStashedClaim.mockResolvedValue(buildClaim(new Date('2025-06-01T00:00:00.000Z')));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      const form = renderedForm();
      expect(form.model).toEqual(expect.objectContaining({
        year: 2025,
        month: 6,
        day: 1,
      }));
    });

    it('should call next when draft store throws error', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);
      req.body = {year: '9999', month: '12', day: '25'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call getStashedClaimOrFromStore only once per POST request', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should re-render with errors on no input', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('date')).toBe('ERRORS.VALID_AGREED_RESPONSE_DATE');
    });

    it('should re-render with error on agreed date in the past', async () => {
      req.body = {year: '1999', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('date')).toBe('ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST');
    });

    it('should re-render with error on agreed date before the original deadline', async () => {
      req.body = {year: '2022', month: '05', day: '10'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('date')).toBe('ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST');
    });

    it('should re-render with error on incorrect year', async () => {
      req.body = {year: '199', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should re-render when agreed response date is more than 28 days', async () => {
      req.body = {year: '2050', month: '6', day: '13'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('date')).toBe('ERRORS.DATE_NOT_MORE_THAN_28_DAYS');
    });

    it('should accept the 28th day after the original response deadline and redirect', async () => {
      req.body = {year: '2050', month: '6', day: '12'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(ResponseDeadlineService.prototype.saveAgreedResponseDeadline).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, NEW_RESPONSE_DEADLINE_URL));
    });

    it('should accept a date less than 28 days after original response deadline and redirect', async () => {
      req.body = {year: '2050', month: '6', day: '11'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, NEW_RESPONSE_DEADLINE_URL));
    });

    it('should call next when saving the agreed date fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
