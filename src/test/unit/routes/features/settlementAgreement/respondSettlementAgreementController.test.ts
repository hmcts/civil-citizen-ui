import {Response} from 'express';
import respondSettlementAgreementController from 'routes/features/settlementAgreement/respondSettlementAgreementController';
import {
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
    submitDefendantSignSettlementAgreementEvent: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
  submitDefendantSignSettlementAgreementEvent: jest.Mock;
};

const claimId = '12345';
const viewPath = 'features/settlementAgreement/respond-settlement-agreement';

const namedClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {firstName: 'James', lastName: 'White'},
  } as Claim['applicant1'];
  claim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {firstName: 'John', lastName: 'White'},
  } as Claim['respondent1'];
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(respondSettlementAgreementController, method, DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Respond To Settlement Agreement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockResolvedValue(namedClaim());
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(namedClaim());
    civilServiceMethods.submitDefendantSignSettlementAgreementEvent.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the settlement agreement page', async () => {
      const {res} = await invoke('get');

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        data: expect.objectContaining({
          claimant: 'James White',
          defendant: 'John White',
        }),
      }));
    });

    it('should pass the error to next when retrieving the claim fails', async () => {
      const error = new Error('civil service failure');
      civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should render the page when no option is chosen', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(civilServiceMethods.submitDefendantSignSettlementAgreementEvent).not.toHaveBeenCalled();
    });

    it('should submit the agreement and redirect to confirmation when the option is yes', async () => {
      const {res} = await invoke('post', {body: {option: 'yes'}});

      expect(civilServiceMethods.submitDefendantSignSettlementAgreementEvent).toHaveBeenCalledWith(
        claimId,
        {respondentSignSettlementAgreement: YesNoUpperCamelCase.YES},
        expect.anything(),
      );
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION),
      );
    });

    it('should pass the error to next when loading the claim fails', async () => {
      const error = new Error('claim lookup failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {res, next} = await invoke('post', {body: {option: 'yes'}});

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
