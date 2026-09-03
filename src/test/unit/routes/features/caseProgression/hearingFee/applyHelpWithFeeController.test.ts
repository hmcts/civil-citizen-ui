import {Request, Response} from 'express';
import applyHelpWithFeeController from '../../../../../../main/routes/features/caseProgression/hearingFee/applyHelpWithFeeController';
import {APPLY_HELP_WITH_FEES_REFERENCE, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/caseProgression/hearingFee/applyHelpWithFeesPageContent', () => ({
  getHearingFeeStartPageContent: jest.fn(() => [{title: 'Apply for help with fees'}]),
}));

describe('Apply for help with fees', () => {
  const getHandler = getRouteHandler(applyHelpWithFeeController, 'get');
  const postHandler = getRouteHandler(applyHelpWithFeeController, 'post');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  const mockGetClaimById = getClaimById as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    const claim = new Claim();
    claim.totalClaimAmount = 1000;
    mockGetClaimById.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the apply help with fees start page', async () => {
      await getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(
        'features/caseProgression/hearingFee/apply-help-with-fees',
        expect.objectContaining({
          redirectUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
          pageTitle: 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE',
        }),
      );
    });
  });

  describe('on POST', () => {
    it('should redirect to the help with fees reference page', async () => {
      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_REFERENCE));
    });
  });
});
