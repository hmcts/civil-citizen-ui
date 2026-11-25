import {Response} from 'express';
import confirmYourDetailsEvidenceController from '../../../../../main/routes/features/directionsQuestionnaire/confirmYourDetailsEvidenceController';
import {DQ_DEFENDANT_WITNESSES_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/response/responseDraftStoreService');

describe('Confirm your details evidence Controller', () => {
  const getHandler = getRouteHandler(confirmYourDetailsEvidenceController, 'get');
  const postHandler = getRouteHandler(confirmYourDetailsEvidenceController, 'post');
  const viewPath = 'features/directionsQuestionnaire/confirm-your-details-evidence';
  const claimId = '12345';
  const validDetails = {
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'test@test.com',
    phoneNumber: '600000000',
    jobTitle: 'Doctor',
  };
  let req: {params: {id: string}; body: Record<string, unknown>; session: ReturnType<typeof createMockSession>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;
  const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
  const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  const expectFormErrors = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    expect(mockSaveDraftClaim).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      session: createMockSession({user: {id: 'user-1'}}),
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(`${claimId}user-1`);
    mockGetCaseData.mockResolvedValue(buildClaim());
    mockGetResponseClaimById.mockResolvedValue(buildClaim());
    mockGetResponseDraft.mockResolvedValue({
      claimResponse: {case_data: buildClaim()},
      rawResponse: {draftId: 'draft-1'},
      createdAt: new Date().toISOString(),
    });
    mockUpdateResponseDraft.mockResolvedValue(undefined);
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the confirm your details page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
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
    it('should re-render when required details are missing', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when the email address is invalid', async () => {
      req.body = {...validDetails, emailAddress: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should re-render when the phone number is invalid', async () => {
      req.body = {...validDetails, phoneNumber: 'test'};

      await postHandler(req as never, res as unknown as Response, next);

      expectFormErrors();
    });

    it('should save and redirect to witnesses when the details are valid', async () => {
      req.body = validDetails;

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockUpdateResponseDraft.mockRejectedValue(error);
      req.body = validDetails;

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
