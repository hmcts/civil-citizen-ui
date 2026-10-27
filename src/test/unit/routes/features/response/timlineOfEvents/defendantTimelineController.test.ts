import {Response} from 'express';
import defendantTimelineController from '../../../../../../main/routes/features/response/timelineOfEvents/defendantTimelineController';
import {CITIZEN_EVIDENCE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {saveDefendantTimeline} from 'services/features/response/timelineOfEvents/defendantTimelineService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/timelineOfEvents/defendantTimelineService', () => ({
  ...jest.requireActual('services/features/response/timelineOfEvents/defendantTimelineService'),
  saveDefendantTimeline: jest.fn(),
}));

describe('defendant timeline controller', () => {
  const getHandler = getRouteHandler(defendantTimelineController, 'get');
  const postHandler = getRouteHandler(defendantTimelineController, 'post');
  const viewPath = 'features/response/timelineOfEvents/defendant-timeline';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockSaveDefendantTimeline = saveDefendantTimeline as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.timelineOfEvents = [];
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockSaveDefendantTimeline.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the timeline page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

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
      expect(mockSaveDefendantTimeline).not.toHaveBeenCalled();
    });

    it('should re-render when a description is entered without a date', async () => {
      req.body = {rows: [{description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDefendantTimeline).not.toHaveBeenCalled();
    });

    it('should save and redirect to evidence when the timeline is valid', async () => {
      req.body = {rows: [{day: 17, month: 11, year: 2022, description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDefendantTimeline).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({description: 'something happened'}),
          ]),
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveDefendantTimeline.mockRejectedValue(error);
      req.body = {rows: [{day: 17, month: 11, year: 2022, description: 'something happened'}]};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
