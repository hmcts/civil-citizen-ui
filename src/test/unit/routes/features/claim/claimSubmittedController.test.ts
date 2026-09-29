import {Request, Response} from 'express';
import claimSubmittedController from '../../../../../main/routes/features/claim/claimSubmittedController';
import {CLAIM_FEE_BREAKUP} from 'routes/urls';
import {Claim} from 'models/claim';
import {YesNo} from 'form/models/yesNo';
import {CivilServiceClient} from 'client/civilServiceClient';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

describe('Claim Submitted Controller', () => {
  const getHandler = getRouteHandler(claimSubmittedController, 'get');
  const claimId = '1111111111';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (helpWithFees: YesNo): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'isEmpty').mockReturnValue(false);
    jest.spyOn(claim, 'hasHelpWithFees').mockReturnValue(helpWithFees === YesNo.YES);
    jest.spyOn(claim, 'getFormattedCaseReferenceNumber').mockReturnValue(claimId);
    jest.spyOn(claim, 'getDefendantFullName').mockReturnValue('Jane Defendant');
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.restoreAllMocks();
  });

  it('should render the claim submitted page without help with fees', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim(YesNo.NO));

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/claim/claim-submitted',
      expect.objectContaining({
        claimId,
        helpWithFee: false,
        redirectUrl: CLAIM_FEE_BREAKUP.replace(':id', claimId),
        pageTitle: 'PAGES.CLAIM_SUBMITTED.PAGE_TITLE',
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should render with help with fees when the claim has HWF', async () => {
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim(YesNo.YES));

    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/claim/claim-submitted',
      expect.objectContaining({helpWithFee: true}),
    );
  });

  it('should call next when retrieveClaimDetails fails', async () => {
    const error = new Error('Test error');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.render).not.toHaveBeenCalled();
  });
});
