import {Request, Response} from 'express';
import payHearingFeeConfirmationController from '../../../../../../main/routes/features/caseProgression/hearingFee/payHearingFeeConfirmationController';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('Pay Hearing Fee Confirmation Screen Controller', () => {
  const getHandler = getRouteHandler(payHearingFeeConfirmationController, 'get');
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    const claim = new Claim();
    claim.caseProgression = {helpFeeReferenceNumberForm: {referenceNumber: 'HWF-123'}} as Claim['caseProgression'];
    mockGetCaseData.mockResolvedValue(claim);
  });

  it('should render the confirmation page when the claim exists', async () => {
    await getHandler(req as Request, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(
      'features/caseProgression/hearingFee/pay-hearing-fee-confirmation',
      expect.objectContaining({
        referenceNumber: 'HWF-123',
        noCrumbs: true,
      }),
    );
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('redis failure');
    mockGetCaseData.mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
