import {Response} from 'express';
import claimantResponseConfirmationController from 'routes/features/claimantResponse/claimantResponseConfirmationController';
import {CLAIMANT_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {refreshDraftStoreClaimFrom} from 'modules/utilityService';
import {getRespondToSettlementAgreementDeadline} from 'services/features/claimantResponse/signSettlmentAgreementService';
import {getClaimantResponseConfirmationContent} from 'services/features/claimantResponse/claimantResponseConfirmation/claimantResponseConfirmationContentService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  refreshDraftStoreClaimFrom: jest.fn(),
}));
jest.mock('services/features/claimantResponse/signSettlmentAgreementService', () => ({
  getRespondToSettlementAgreementDeadline: jest.fn(),
}));
jest.mock('services/features/claimantResponse/claimantResponseConfirmation/claimantResponseConfirmationContentService', () => ({
  getClaimantResponseConfirmationContent: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
}));

const viewPath = 'features/claimantResponse/claimant-response-confirmation';
const claimId = '12345';
const confirmationContent = [{data: {title: 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.RC_DISPUTE.NOT_PROCEED_WITH_CLAIM'}}];
const deadline = new Date('2024-06-01');

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantResponseConfirmationController, 'get', CLAIMANT_RESPONSE_CONFIRMATION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {lang: 'en'},
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
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
    (getRespondToSettlementAgreementDeadline as jest.Mock).mockResolvedValue(deadline);
    (getClaimantResponseConfirmationContent as jest.Mock).mockReturnValue(confirmationContent);
  });

  describe('on GET', () => {
    it('renders the confirmation view with the content service result', async () => {
      const claim = new Claim();
      claim.totalClaimAmount = 100;
      claim.submittedDate = new Date('2024-01-01');
      (refreshDraftStoreClaimFrom as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(getClaimantResponseConfirmationContent).toHaveBeenCalledWith(claim, 'en', false, false, deadline);
      expect(res.render).toHaveBeenCalledWith(viewPath, {
        claimantResponseConfirmationContent: confirmationContent,
        pageTitle: 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PAGE_TITLE',
      });
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (refreshDraftStoreClaimFrom as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
