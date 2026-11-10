import {Response} from 'express';
import respondSettlementAgreementConfirmationController from 'routes/features/settlementAgreement/respondSettlementAgreementConfirmationController';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
}));
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

const claimId = '12345';
const viewPath = 'features/settlementAgreement/respond-settlement-agreement-confirmation';

const signedClaim = (decision: YesNoUpperCamelCase): Claim => {
  const claim = new Claim();
  claim.respondentSignSettlementAgreement = decision;
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(respondSettlementAgreementConfirmationController, 'get', DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Claimant response confirmation controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the signed settlement agreement confirmation', async () => {
      (getClaimById as jest.Mock).mockResolvedValue(signedClaim(YesNoUpperCamelCase.YES));

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantResponseConfirmationContent: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: expect.stringContaining('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.ACCEPTED_SETTLEMENT_AGREEMENT_TITLE'),
            }),
          }),
        ]),
      }));
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
    });

    it('should render the rejected settlement agreement confirmation', async () => {
      (getClaimById as jest.Mock).mockResolvedValue(signedClaim(YesNoUpperCamelCase.NO));

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantResponseConfirmationContent: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              title: expect.stringContaining('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT_CONFIRMATION.REJECTED_SETTLEMENT_AGREEMENT_TITLE'),
            }),
          }),
        ]),
      }));
    });

    it('should pass the error to next when loading the claim fails', async () => {
      const error = new Error('claim lookup failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});
