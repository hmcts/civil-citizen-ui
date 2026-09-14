import {Response} from 'express';
import sendYourResponseByEmailController from '../../../../../../main/routes/features/response/eligibility/sendYourResponseByEmailController';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {FeeRanges} from 'models/feeRange';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {PartyType} from 'models/partyType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Send your response by email', () => {
  const getHandler = getRouteHandler(sendYourResponseByEmailController, 'get');
  const viewPath = 'features/response/eligibility/send-your-response-by-email';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;

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
    mockGetCaseData.mockResolvedValue(buildClaim());
    jest.spyOn(CivilServiceClient.prototype, 'getFeeRanges').mockResolvedValue(new FeeRanges([]));
  });

  describe('on GET', () => {
    it('should render send your response by email page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(Claim),
        fees: expect.any(Array),
        ResponseType,
        RejectAllOfClaimType,
        partyType: PartyType,
        responseDeadline: '15 May 2050',
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
