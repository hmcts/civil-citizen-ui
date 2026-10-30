import {Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import claimantResponseConfirmationController from 'routes/features/claimantResponse/claimantResponseConfirmationController';
import {CLAIMANT_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {getRespondToSettlementAgreementDeadline} from 'services/features/claimantResponse/signSettlmentAgreementService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {ChooseHowToProceed} from 'form/models/claimantResponse/chooseHowToProceed';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  refreshDraftStoreClaimFrom: jest.fn(),
}));
jest.mock('services/features/claimantResponse/signSettlmentAgreementService', () => ({
  getRespondToSettlementAgreementDeadline: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
}));

const viewPath = 'features/claimantResponse/claimant-response-confirmation';
const claimId = '12345';

const confirmationClaim = (): Claim => {
  const claim = new Claim();
  claim.ccdState = CaseState.JUDICIAL_REFERRAL;
  claim.totalClaimAmount = 100;
  claim.respondent1ResponseDate = new Date('2024-02-01');
  claim.applicant1ResponseDate = new Date('2024-03-01');
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.intentionToProceed = {option: YesNo.NO} as GenericYesNo;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.DISPUTE);
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.partyDetails = {firstName: 'Joe', lastName: 'Bloggs'} as unknown as Party['partyDetails'];
  return claim;
};

const invoke = async (req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantResponseConfirmationController, 'get', CLAIMANT_RESPONSE_CONFIRMATION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {lang: 'en'},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedContent = (res: ReturnType<typeof createMockResponse>): string => {
  return JSON.stringify(res.render.mock.calls[0][1].claimantResponseConfirmationContent);
};

describe('Claimant response confirmation controller', () => {
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
    (getRespondToSettlementAgreementDeadline as jest.Mock).mockResolvedValue(new Date('2024-06-01'));
  });

  describe('on GET', () => {
    it('should return claimant response confirmation claim', async () => {
      const claim = confirmationClaim();
      (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PAGE_TITLE',
      }));
      expect(renderedContent(res)).toContain("You didn't proceed with the claim");
    });

    it('should return claimant response confirmation claim for settlement agreement', async () => {
      const claim = confirmationClaim();
      const chooseHowToProceed = new ChooseHowToProceed();
      chooseHowToProceed.option = ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
      claim.claimantResponse.chooseHowToProceed = chooseHowToProceed;
      (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(renderedContent(res)).toContain("You've signed a settlement agreement");
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (refreshDraftStoreClaimFrom as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
