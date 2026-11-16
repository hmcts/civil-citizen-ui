import {Response} from 'express';
import requestExtra4WeeksController from '../../../../../main/routes/features/directionsQuestionnaire/requestExtra4WeeksController';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  SUBJECT_TO_FRC_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as launchDarklyClient from 'app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

describe('Request extra 4 weeks to Settle Claim Controller', () => {
  const getHandler = getRouteHandler(requestExtra4WeeksController, 'get');
  const postHandler = getRouteHandler(requestExtra4WeeksController, 'post');
  const viewPath = 'features/directionsQuestionnaire/request-extra-4weeks';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const isMintiEnabledForCase = launchDarklyClient.isMintiEnabledForCase as jest.Mock;

  const buildClaim = (totalClaimAmount?: number): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    if (totalClaimAmount !== undefined) {
      claim.totalClaimAmount = totalClaimAmount;
    }
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
    isMintiEnabledForCase.mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render the extra 4 weeks page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.REQUEST_EXTRA_4WEEKS.PAGE_TITLE',
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
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect to consider claimant documents when yes is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL));
    });

    it('should save and redirect to consider claimant documents when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL));
    });

    it('should save and redirect to fixed recoverable costs when minti is enabled for an intermediate track claim', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim(26000));
      isMintiEnabledForCase.mockResolvedValue(true);
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, SUBJECT_TO_FRC_URL));
    });

    it('should save and redirect to disclosure of documents when minti is enabled for a multi track claim', async () => {
      mockGetCaseData.mockResolvedValue(buildClaim(150000));
      isMintiEnabledForCase.mockResolvedValue(true);
      req.body = {option: YesNo.NO};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_DISCLOSURE_OF_DOCUMENTS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
