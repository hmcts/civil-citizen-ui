import {Response} from 'express';
import applyHelpWithFeesController from 'routes/features/helpWithFees/helpWithFeesController';
import {
  APPLY_HELP_WITH_FEES,
  APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

const claimId = '12345';
const viewPath = 'features/helpWithFees/help-fees-start';

const hearingFeeClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.feeTypeHelpRequested = FeeType.HEARING;
  claim.caseProgressionHearing = new CaseProgressionHearing();
  claim.caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation({
    calculatedAmountInPence: '7000',
    version: '1',
    code: '1',
  });
  return claim;
};

const invoke = async (method: 'get' | 'post', body: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(applyHelpWithFeesController, method, APPLY_HELP_WITH_FEES)(
    {
      params: {id: claimId},
      body,
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Arrive on help with fees', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockResolvedValue(hearingFeeClaim());
  });

  describe('on GET', () => {
    it('should render the help with fees page with the hearing fee back link', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION),
        cancelUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
        applyHelpWithFeesContent: expect.any(Array),
      }));
    });
  });

  describe('on POST', () => {
    it('should render the page when no option is chosen', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to the hearing fee page when the option is no', async () => {
      const {res} = await invoke('post', {option: YesNo.NO});

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, HEARING_FEE_APPLY_HELP_FEE_SELECTION),
      );
    });

    it('should redirect to the help with fees start page when the option is yes', async () => {
      const {res} = await invoke('post', {option: YesNo.YES});

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START),
      );
    });
  });
});
