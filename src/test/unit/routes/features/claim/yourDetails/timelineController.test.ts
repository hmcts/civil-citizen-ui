import {Response} from 'express';
import timelineController from '../../../../../../main/routes/features/claim/yourDetails/timelineController';
import {CLAIM_EVIDENCE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {getClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {getTimeline, saveTimeline} from 'services/features/claim/yourDetails/timelineService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/details/claimDetailsService', () => ({
  getClaimDetails: jest.fn(),
  saveClaimDetails: jest.fn(),
}));
jest.mock('services/features/claim/yourDetails/timelineService', () => ({
  getTimeline: jest.fn(),
  saveTimeline: jest.fn(),
}));

describe('Claimant Timeline Controller', () => {
  const getHandler = getRouteHandler(timelineController, 'get');
  const postHandler = getRouteHandler(timelineController, 'post');
  const viewPath = 'features/claim/yourDetails/timeline';
  const pageTitle = 'PAGES.TIMELINE.TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimDetails = getClaimDetails as jest.Mock;
  const mockGetTimeline = getTimeline as jest.Mock;
  const mockSaveTimeline = saveTimeline as jest.Mock;
  const validRows = [{
    day: 1,
    month: 3,
    year: 2023,
    description: 'Raised an issue with Mr. Smith',
  }];

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
    mockGetTimeline.mockReturnValue(ClaimantTimeline.buildEmptyForm());
    mockSaveTimeline.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render timeline page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading claim details fails', async () => {
      const error = new Error('error');
      mockGetClaimDetails.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render timeline page if there are validation errors', async () => {
      req.body = {rows: []};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next if building the form throws', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should save data and redirect to evidence page if all required details are provided', async () => {
      req.body = {rows: validRows};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTimeline).toHaveBeenCalledWith('user-id', expect.any(ClaimantTimeline));
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_EVIDENCE_URL);
    });

    it('should save data if applicant does not exist and redirect to evidence page', async () => {
      mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
      req.body = {rows: validRows};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTimeline).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_EVIDENCE_URL);
    });
  });
});
