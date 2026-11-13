import {Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import respondSettlementAgreementConfirmationController from 'routes/features/settlementAgreement/respondSettlementAgreementConfirmationController';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';
import {settlementAgreementClaim} from '../../../../utils/settlementAgreementClaim';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
  generateRedisKey: jest.fn(),
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
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it.each([
      {courtAccepted: true, option: PaymentOptionType.IMMEDIATELY, responseType: ResponseType.FULL_ADMISSION, date: '1 May 2035'},
      {courtAccepted: true, option: PaymentOptionType.BY_SET_DATE, responseType: ResponseType.FULL_ADMISSION, date: '1 June 2035'},
      {courtAccepted: false, option: PaymentOptionType.BY_SET_DATE, responseType: ResponseType.FULL_ADMISSION, date: '1 August 2035'},
      {courtAccepted: false, option: PaymentOptionType.BY_SET_DATE, responseType: ResponseType.PART_ADMISSION, date: '1 August 2035'},
      {courtAccepted: true, option: PaymentOptionType.INSTALMENTS, responseType: ResponseType.FULL_ADMISSION, date: undefined},
      {courtAccepted: false, option: PaymentOptionType.INSTALMENTS, responseType: ResponseType.FULL_ADMISSION, date: undefined},
    ])('renders accepted $option guidance (claimant plan accepted=$courtAccepted, $responseType)', async ({courtAccepted, option, responseType, date}) => {
      const claim = settlementAgreementClaim(courtAccepted, option, responseType);
      claim.respondentSignSettlementAgreement = YesNoUpperCamelCase.YES;
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);

      const {res, next} = await invoke();

      expect(res.render).toHaveBeenCalledTimes(1);
      const sections = res.render.mock.calls[0][1].claimantResponseConfirmationContent as ClaimSummarySection[];
      const paragraphs = sections.filter(section => section.type === 'p').map(section => section.data.text);
      expect(paragraphs).toEqual([
        ...(date ? [`The agreement says you'll repay by ${date}.`] : []),
        "The claimant can't request a County Court Judgment against you unless you break the terms.",
        'Make sure you get receipts for any payments.',
      ]);
      expect(sections).toContainEqual(expect.objectContaining({
        data: expect.objectContaining({text: 'Contact James White', href: '/dashboard/12345/contact-them'}),
      }));
      expect(next).not.toHaveBeenCalled();
    });

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
      const sections = res.render.mock.calls[0][1].claimantResponseConfirmationContent as ClaimSummarySection[];
      expect(sections.filter(section => section.type === 'p').map(section => section.data.text)).toEqual([
        'The claimant can request a County Court Judgment (CCJ) against you. The CCJ would order you to repay the money in line with the terms of the agreement.',
        'If they request a CCJ, you can ask a judge to consider changing the repayment plan, based on your financial details.',
        'The court has reviewed the plan and believes you can afford it, so a judge may not change it.',
        "We'll email you when the claimant responds.",
      ]);
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
