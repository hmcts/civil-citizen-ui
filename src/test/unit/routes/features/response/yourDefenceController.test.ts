import {Response} from 'express';
import yourDefenceController from '../../../../../main/routes/features/response/yourDefenceController';
import {CITIZEN_TIMELINE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {saveYourDefence} from 'services/features/response/yourDefenceService';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/yourDefenceService');

describe('yourDefence', () => {
  const getHandler = getRouteHandler(yourDefenceController, 'get');
  const postHandler = getRouteHandler(yourDefenceController, 'post');
  const viewPath = 'features/response/your-defence';
  const claimId = '12345';
  let req: {params: {id: string}; body: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockSaveYourDefence = saveYourDefence as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockSaveYourDefence.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the defence page with the claimant name', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: 'Mr Jan Clark',
      }));
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the defence text is missing', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: 'Mr Jan Clark',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveYourDefence).not.toHaveBeenCalled();
    });

    it('should save and redirect to the timeline when text is provided', async () => {
      req.body = {text: 'Test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveYourDefence).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({text: 'Test'}),
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveYourDefence.mockRejectedValue(error);
      req.body = {text: 'Test'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
