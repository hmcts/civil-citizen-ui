import {Response} from 'express';
import cantAttendHearingInNext12MonthsController from '../../../../../../main/routes/features/directionsQuestionnaire/hearing/cantAttendHearingInNext12MonthsController';
import {DQ_AVAILABILITY_DATES_FOR_HEARING_URL, DQ_PHONE_OR_VIDEO_HEARING_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDraftDefendantResponseDatabaseEnabled: jest.fn().mockResolvedValue(false),
}));

describe('cannot attend hearing in next months Controller', () => {
  const getHandler = getRouteHandler(cantAttendHearingInNext12MonthsController, 'get');
  const postHandler = getRouteHandler(cantAttendHearingInNext12MonthsController, 'post');
  const viewPath = 'features/directionsQuestionnaire/hearing/cant-attend-hearing-in-next-12-months';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>; session: ReturnType<typeof createMockSession>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      session: createMockSession({user: {id: 'user-1'}}),
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(`${claimId}user-1`);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockGetResponseDraft.mockResolvedValue({
      claimResponse: {case_data: buildClaim()},
      rawResponse: {draftId: 'draft-1'},
      createdAt: new Date().toISOString(),
    });
    mockUpdateResponseDraft.mockResolvedValue(undefined);
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the cannot attend hearing page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE',
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
    it('should re-render when no option is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to availability dates when yes is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_AVAILABILITY_DATES_FOR_HEARING_URL));
    });

    it('should save and redirect to phone or video hearing when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
