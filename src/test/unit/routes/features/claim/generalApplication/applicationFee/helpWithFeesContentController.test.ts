import {Response} from 'express';
import helpWithFeesContentController from '../../../../../../../main/routes/features/generalApplication/applicationFee/helpWithFeesContentController';
import {DASHBOARD_CLAIMANT_URL, GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getApplicationFeeContentPageDetails} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/generalApplication/applicationFee/helpWithApplicationFeeContent', () => ({
  getApplicationFeeContentPageDetails: jest.fn(),
}));

describe('General Application - Apply for help with fees', () => {
  const getHandler = getRouteHandler(helpWithFeesContentController, 'get');
  const viewPath = 'features/generalApplication/applicationFee/help-with-application-fee-content';
  const claimId = '12345';
  const appId = '67890';
  const feeContent = [{data: {text: 'PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING'}}];
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (getApplicationFeeContentPageDetails as jest.Mock).mockReturnValue(feeContent);
  });

  describe('on GET', () => {
    it('should render the application fee help content', async () => {
      req.query = {additionalFeeTypeFlag: 'false'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(getApplicationFeeContentPageDetails).toHaveBeenCalledWith(claimId, false, appId);
      expect(res.render).toHaveBeenCalledWith(viewPath, {
        backLinkUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=false'),
        redirectUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
        applyHelpWithFeeContents: feeContent,
      });
    });

    it('should render the additional application fee help content', async () => {
      req.query = {additionalFeeTypeFlag: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(getApplicationFeeContentPageDetails).toHaveBeenCalledWith(claimId, true, appId);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag=true'),
        applyHelpWithFeeContents: feeContent,
      }));
    });
  });
});
