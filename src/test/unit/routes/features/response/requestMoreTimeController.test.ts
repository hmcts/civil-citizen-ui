import {Response} from 'express';
import requestMoreTimeController from '../../../../../main/routes/features/response/requestMoreTimeController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {ResponseDeadline} from 'form/models/responseDeadline';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {PartyType} from 'models/partyType';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('common/utils/claimRequestLocals', () => ({
  getStashedClaimOrFromStore: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Request More Time Controller', () => {
  const getHandler = getRouteHandler(requestMoreTimeController, 'get');
  const postHandler = getRouteHandler(requestMoreTimeController, 'post');
  const viewPath = 'features/response/request-more-time';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetStashedClaim = getStashedClaimOrFromStore as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {
        partyName: 'Joe Bloggs',
      },
    };
    jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('15 May 2050');
    jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Joe Bloggs');
    return claim;
  };

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
    mockGetStashedClaim.mockReset();
    mockGetStashedClaim.mockResolvedValue(buildClaim());
    (launchDarklyClient.isCuiGaNroEnabled as jest.Mock).mockResolvedValue(false);
    jest.spyOn(ResponseDeadlineService.prototype, 'saveAdditionalTime').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the page if there is no additional time set', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        additionalTimeOptions: AdditionalTimeOptions,
        form: expect.any(GenericForm),
        claimantName: 'Joe Bloggs',
        responseDate: '15 May 2050',
      }));
    });

    it('should call getStashedClaimOrFromStore only once per GET request', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetStashedClaim).toHaveBeenCalledTimes(1);
    });

    it('should render the page if additional time is set', async () => {
      const claim = new Claim();
      claim.applicant1 = {
        type: PartyType.SOLE_TRADER,
        partyDetails: {
          partyName: 'Miss Jane',
        },
      };
      claim.responseDeadline = new ResponseDeadline();
      claim.responseDeadline.additionalTime = AdditionalTimeOptions.MORE_THAN_28_DAYS;
      jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('15 May 2050');
      jest.spyOn(claim, 'getClaimantFullName').mockReturnValue('Miss Jane');
      mockGetStashedClaim.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName: 'Miss Jane',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(AdditionalTimeOptions.MORE_THAN_28_DAYS);
    });

    it('should call next when the claim is missing', async () => {
      mockGetStashedClaim.mockResolvedValue(undefined);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetStashedClaim.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when additional time option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        claimantName: 'Joe Bloggs',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to task list if "Up to 28 days" option is selected', async () => {
      req.body = {option: AdditionalTimeOptions.UP_TO_28_DAYS};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(ResponseDeadlineService.prototype.saveAdditionalTime).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to task list if "More than 28 days" option is selected', async () => {
      req.body = {option: AdditionalTimeOptions.MORE_THAN_28_DAYS};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render when invalid option is provided', async () => {
      req.body = {option: 'foo'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when saving additional time fails', async () => {
      const error = new Error('error');
      (ResponseDeadlineService.prototype.saveAdditionalTime as jest.Mock).mockRejectedValue(error);
      req.body = {option: AdditionalTimeOptions.MORE_THAN_28_DAYS};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
