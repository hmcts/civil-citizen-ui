import {Response} from 'express';
import unavailableDatesForHearingController from '../../../../../../main/routes/features/directionsQuestionnaire/hearing/unavailableDatesForHearingController';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, DQ_UNAVAILABLE_FOR_HEARING_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Unavailable dates for hearing Controller', () => {
  const getHandler = getRouteHandler(unavailableDatesForHearingController, 'get');
  const postHandler = getRouteHandler(unavailableDatesForHearingController, 'post');
  const viewPath = 'features/directionsQuestionnaire/hearing/unavailable-dates-for-hearing';
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

  const addDays = (days: number): Date => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
  };

  const dateParts = (date: Date) => ({
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const expectFormErrors = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(mockSaveDraftClaim).not.toHaveBeenCalled();
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
    it('should render the unavailable dates page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.UNAVAILABLE_DATES_FOR_HEARING.PAGE_TITLE',
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

  describe('on POST', () => {
    it('should re-render when a single date or longer period is not selected', async () => {
      req.body = {items: [{single: {}}]};

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a single date is selected but no date is provided', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.SINGLE_DATE,
          single: {},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a single date is in the past', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.SINGLE_DATE,
          single: {start: {day: 15, month: 10, year: 2020}},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a single date is beyond the next 12 months', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.SINGLE_DATE,
          single: {start: {day: 15, month: 10, year: 3022}},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a longer period is selected but no dates are provided', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.LONGER_PERIOD,
          period: {},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a longer period is in the past', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.LONGER_PERIOD,
          period: {
            start: {day: 15, month: 10, year: 2020},
            end: {day: 20, month: 10, year: 2020},
          },
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when a longer period is beyond the next 12 months', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.LONGER_PERIOD,
          period: {
            start: {day: 15, month: 10, year: 3022},
            end: {day: 20, month: 11, year: 3022},
          },
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when the from date is after the to date', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.LONGER_PERIOD,
          period: {
            start: dateParts(addDays(30)),
            end: dateParts(addDays(16)),
          },
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should save and redirect to phone or video hearing when unavailable dates are 30 days or fewer', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.SINGLE_DATE,
          single: {start: dateParts(addDays(14))},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    });

    it('should save and redirect to why unavailable when unavailable dates are more than 30 days', async () => {
      req.body = {
        items: [{
          type: UnavailableDateType.LONGER_PERIOD,
          period: {
            start: dateParts(addDays(1)),
            end: dateParts(addDays(40)),
          },
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_UNAVAILABLE_FOR_HEARING_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {
        items: [{
          type: UnavailableDateType.SINGLE_DATE,
          single: {start: dateParts(addDays(14))},
        }],
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
