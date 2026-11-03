import {Response} from 'express';
import defendantTimelineController from '../../../../../../main/routes/features/response/timelineOfEvents/defendantTimelineController';
import {CITIZEN_EVIDENCE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('defendant timeline controller', () => {
  const getHandler = getRouteHandler(defendantTimelineController, 'get');
  const postHandler = getRouteHandler(defendantTimelineController, 'post');
  const viewPath = 'features/response/timelineOfEvents/defendant-timeline';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; query: Record<string, string>; cookies: Record<string, string>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the timeline page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the claimant timeline with formatted dates', async () => {
      const claim = new Claim();
      claim.timelineOfEvents = [
        {id: '1', value: {timelineDate: '2024-03-15', timelineDescription: 'Contract signed'}},
        {id: '2', value: {timelineDate: undefined, timelineMonth: '6', timelineYear: '2023', timelineDescription: 'Goods delivered'}},
      ];
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        theirTimeline: [
          {timelineDate: '15 March 2024', timelineDescription: 'Contract signed'},
          {timelineDate: 'June 2023', timelineDescription: 'Goods delivered'},
        ],
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when a date is entered without a description', async () => {
      req.body = {rows: [{day: 17, month: 11, year: 2022, description: ''}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when a description is entered without a date', async () => {
      req.body = {rows: [{description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should save and redirect to evidence when the timeline is valid', async () => {
      req.body = {rows: [{day: 17, month: 11, year: 2022, description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {rows: [{day: 17, month: 11, year: 2022, description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
