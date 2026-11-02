import {Response} from 'express';
import {t} from 'i18next';
import ccjConfirmationController from 'routes/features/claimantResponse/ccj/ccjConfirmationController';
import {CCJ_CONFIRMATION_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isJudgmentBufferEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {CaseState} from 'form/models/claimDetails';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isJudgmentBufferEnabled: jest.fn(),
}));

const viewPath = 'features/claimantResponse/ccj/ccj-confirmation';
const claimId = '12345';
const defendantName = 'Joe Bloggs';

const namedClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.partyDetails = {firstName: 'Joe', lastName: 'Bloggs'} as unknown as Party['partyDetails'];
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(ccjConfirmationController, 'get', CCJ_CONFIRMATION_URL)(
    {
      params: {id: claimId},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('CCJ confirmation controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should return ccj confirmation page', async () => {
      const claim = namedClaim();
      jest.spyOn(claim, 'isCCJCompleteForJo').mockReturnValue(false);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isJudgmentOnline: false,
        isJudgmentRequested: false,
        pageTitle: 'PAGES.CCJ_CONFIRMATION.PAGE_TITLE',
        processYourRequest: t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST', {defendantName}),
        processYourRequest1: t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST_1', {defendantName}),
      }));
    });

    it('should return ccj confirmation page for JO', async () => {
      const claim = namedClaim();
      jest.spyOn(claim, 'isCCJCompleteForJo').mockReturnValue(true);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isJudgmentOnline: true,
        processYourRequest: t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST_JO', {defendantName}),
        processYourRequest1: t('PAGES.CCJ_CONFIRMATION.NO_LONGER_RESPONSE', {defendantName}),
      }));
    });

    it('should return ccj confirmation page when judgment requested and judgment buffer is enabled', async () => {
      const claim = namedClaim();
      claim.ccdState = CaseState.JUDGMENT_REQUESTED;
      jest.spyOn(claim, 'isCCJCompleteForJo').mockReturnValue(false);
      (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(true);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isJudgmentOnline: false,
        isJudgmentRequested: true,
      }));
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
