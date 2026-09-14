import {Response} from 'express';
import defendantTimelineController from '../../../../../../main/routes/features/response/timelineOfEvents/defendantTimelineController';
import {CITIZEN_EVIDENCE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {saveDefendantTimeline} from 'services/features/response/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/timelineOfEvents/defendantTimelineService', () => ({
  getDefendantTimeline: jest.requireActual('services/features/response/timelineOfEvents/defendantTimelineService').getDefendantTimeline,
  saveDefendantTimeline: jest.fn(),
}));

describe('defendant timeline controller', () => {
  const getHandler = getRouteHandler(defendantTimelineController, 'get');
  const postHandler = getRouteHandler(defendantTimelineController, 'post');
  const viewPath = 'features/response/timelineOfEvents/defendant-timeline';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockSaveDefendantTimeline = saveDefendantTimeline as jest.Mock;

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
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDefendantTimeline.mockResolvedValue(undefined);
    jest.spyOn(Claim.prototype, 'extractDocumentId').mockReturnValue(undefined);
  });

  describe('on GET', () => {
    it('should render the timeline page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when date is entered but no description', async () => {
      req.body = {
        rows: [
          {
            day: 17,
            month: 11,
            year: 2022,
            description: '',
          },
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when date is empty and description is defined', async () => {
      req.body = {
        rows: [
          {
            date: '',
            description: 'something happened',
          },
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect when no errors', async () => {
      req.body = {
        rows: [
          {
            day: 17,
            month: 11,
            year: 2022,
            description: 'something happened',
          },
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDefendantTimeline).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveDefendantTimeline.mockRejectedValue(error);
      req.body = {
        rows: [
          {
            day: 17,
            month: 11,
            year: 2022,
            description: 'something happened',
          },
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
