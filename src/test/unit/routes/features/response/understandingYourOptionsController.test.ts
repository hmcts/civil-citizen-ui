import {Response} from 'express';
import understandingYourOptionsController from '../../../../../main/routes/features/response/understandingYourOptionsController';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));

describe('Understanding Your Options Controller', () => {
  const getHandler = getRouteHandler(understandingYourOptionsController, 'get');
  const viewPath = 'features/response/understanding-your-options';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('15 May 2050');
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetStashedClaim.mockReset();
    mockGetStashedClaim.mockResolvedValue(buildClaim());
  });

  describe('on GET', () => {
    it('should call getStashedClaimOrFromStore only once per GET request', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should render understanding your options page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        responseDate: '15 May 2050',
      }));
    });

    it('should pass welsh translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'cy'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        responseDate: '15 May 2050',
      }));
    });

    it('should pass english translation via query', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.query = {lang: 'en'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
    });

    it('should pass welsh translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'cy'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('cy');
    });

    it('should pass english translation via cookie', async () => {
      const claim = buildClaim();
      mockGetStashedClaim.mockResolvedValue(claim);
      req.cookies = {lang: 'en'};
      req.query = {lang: 'en'};

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(claim.formattedResponseDeadline).toHaveBeenCalledWith('en');
    });

    it('should render when response deadline date is not set', async () => {
      const claim = new Claim();
      jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('');
      mockGetStashedClaim.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        responseDate: '',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
