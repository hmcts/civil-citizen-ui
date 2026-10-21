import path from 'path';
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

const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

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
  beforeAll(async () => {
    if (i18next.isInitialized) {
      return;
    }
    await i18next.use(Backend).init({
      backend: {
        loadPath: path.join(__dirname, '../../../../../main/modules/i18n/locales/{{lng}}.json'),
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'cy'],
      load: 'languageOnly',
      initImmediate: false,
    });
  });

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
              title: expect.stringContaining('both signed a settlement agreement'),
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
              title: expect.stringContaining('rejected the settlement agreement'),
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
