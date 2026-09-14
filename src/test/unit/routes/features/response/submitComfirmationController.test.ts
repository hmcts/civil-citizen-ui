import {Response} from 'express';
import submitConfirmationController from '../../../../../main/routes/features/response/submitConfirmationController';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {Party} from 'models/party';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getSubmitConfirmationContent} from 'services/features/response/submitConfirmation/submitConfirmationService';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import fullAdmitPayByImmediatelyMock from '../../../../utils/mocks/fullAdmitPayByImmediatelyMock.json';
import partAdmitPayByImmediatelyMock from '../../../../utils/mocks/partAdmitPayByImmediatelyMock.json';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/response/submitConfirmation/submitConfirmationService', () => ({
  getSubmitConfirmationContent: jest.fn((): unknown[] => []),
}));

describe('Submit confirmation controller', () => {
  const getHandler = getRouteHandler(submitConfirmationController, 'get');
  const viewPath = 'features/response/submit-confirmation';
  const claimId = 'claim-id';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetSubmitConfirmationContent = getSubmitConfirmationContent as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC009';
    claim.respondent1ResponseDate = new Date();
    claim.submittedDate = new Date();
    claim.applicant1 = new Party();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {
        partyName: 'Joe Bloggs',
      },
    };
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
    mockGetSubmitConfirmationContent.mockReturnValue([]);
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim());
  });

  describe('on GET', () => {
    it('should render submit confirmation from claim', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetSubmitConfirmationContent).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimNumber: '000MC009',
        confirmationContent: [],
        responseSubmitDate: expect.any(String),
      }));
    });

    it('should call next when retrieving the claim fails', async () => {
      const error = new Error('error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should render submit confirmation from claim for fullAdmitPayByImmediately', async () => {
      const claim = Object.assign(new Claim(), fullAdmitPayByImmediatelyMock.case_data);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetSubmitConfirmationContent).toHaveBeenCalledWith(
        claimId,
        expect.any(Claim),
        expect.anything(),
        false,
      );
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        confirmationContent: [],
      }));
    });

    it('should render submit confirmation from claim for partAdmitPayByImmediately', async () => {
      const claim = Object.assign(new Claim(), partAdmitPayByImmediatelyMock.case_data);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        confirmationContent: [],
      }));
    });
  });
});
