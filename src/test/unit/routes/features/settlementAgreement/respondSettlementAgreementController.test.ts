import {Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
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
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';
import {settlementAgreementClaim} from '../../../../utils/settlementAgreementClaim';

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
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

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
    it.each([
      {
        courtAccepted: true, paymentOption: PaymentOptionType.BY_SET_DATE, responseType: ResponseType.FULL_ADMISSION,
        agreementText: 'John White will pay £200 no later than 1 June 2035.', completionDate: '1 June 2035',
      },
      {
        courtAccepted: true, paymentOption: PaymentOptionType.INSTALMENTS, responseType: ResponseType.FULL_ADMISSION,
        agreementText: 'John White will repay £200 in instalments of £50 every week. The first instalment will be paid by 1 January 2035.',
        completionDate: '22 January 2035',
      },
      {
        courtAccepted: true, paymentOption: PaymentOptionType.IMMEDIATELY, responseType: ResponseType.FULL_ADMISSION,
        agreementText: 'John White will pay £200 immediately. James White will receive the money no later than 1 May 2035. Any cheques or transfers will be clear in John White’s account by this date.',
        completionDate: '1 May 2035',
      },
      {
        courtAccepted: false, paymentOption: PaymentOptionType.BY_SET_DATE, responseType: ResponseType.PART_ADMISSION,
        agreementText: 'John White will pay £100 no later than 1 August 2035.', completionDate: '1 August 2035',
      },
      {
        courtAccepted: false, paymentOption: PaymentOptionType.INSTALMENTS, responseType: ResponseType.FULL_ADMISSION,
        agreementText: 'John White will repay £200 in instalments of £100 every month. The first instalment will be paid by 1 February 2035.',
        completionDate: '1 March 2035',
      },
    ])('renders $responseType $paymentOption terms (claimant plan accepted=$courtAccepted)', async ({courtAccepted, paymentOption, responseType, agreementText, completionDate}) => {
      civilServiceMethods.retrieveClaimDetails.mockResolvedValueOnce(settlementAgreementClaim(courtAccepted, paymentOption, responseType));

      const {res, next} = await invoke('get', {cookies: {lang: 'en'}});

      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        data: {
          claimant: 'James White', defendant: 'John White',
          agreementText, completionDateText: completionDate,
        },
      }));
      expect(next).not.toHaveBeenCalled();
    });

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
