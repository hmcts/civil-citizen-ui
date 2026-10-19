import {Response} from 'express';
import claimantResponseCheckAnswersController from 'routes/features/claimantResponse/claimantResponseCheckAnswersController';
import {CLAIMANT_RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {getSummarySections} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {OtherWitnesses} from 'models/directionsQuestionnaire/witnesses/otherWitnesses';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/checkAnswers/checkAnswersService', () => ({
  getSummarySections: jest.fn().mockResolvedValue({}),
  saveStatementOfTruth: jest.fn(),
}));
jest.mock('services/features/claimantResponse/submitClaimantResponse', () => ({
  submitClaimantResponse: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isMintiEnabledForCase: jest.fn(),
}));

const viewPath = 'features/claimantResponse/check-answers';
const claimId = '12345';

const baseClaim = (): Claim => {
  const claim = new Claim();
  claim.submittedDate = new Date('2024-01-02');
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantResponseCheckAnswersController, method, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL)(
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

describe('Claimant Response - Check answers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(baseClaim());
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
    (getSummarySections as jest.Mock).mockResolvedValue({});
  });

  describe('Get', () => {
    it('should return check answers page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        summarySections: {},
        pageTitle: 'PAGES.CHECK_YOUR_ANSWER.CLAIMANT_INTENT_PAGE_TITLE',
      }));
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass english translation via query', async () => {
      await invoke('get', {query: {lang: 'en'}});

      expect(getSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'en', expect.anything(), false, false);
    });

    it('should pass cy translation via query', async () => {
      await invoke('get', {query: {lang: 'cy'}});

      expect(getSummarySections).toHaveBeenCalledWith(claimId, expect.any(Claim), 'cy', expect.anything(), false, false);
    });
  });

  describe('on Post', () => {
    it('should return errors when form is incomplete', async () => {
      const claim = baseClaim();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {isClaimantRejectedDefendantOffer: 'true'}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should return errors when a saved witness phone number is invalid', async () => {
      const claim = baseClaim();
      claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
      claim.claimantResponse.directionQuestionnaire.witnesses = {
        otherWitnesses: new OtherWitnesses(YesNo.YES, [
          new OtherWitnessItems({
            firstName: 'Jane',
            lastName: 'Doe',
            telephone: 'not-a-phone-number',
            details: 'Saw what happened',
          }),
        ]),
      };
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {isClaimantRejectedDefendantOffer: 'false', signed: 'true'}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should return 500 when error in service', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {isClaimantRejectedDefendantOffer: 'true'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
