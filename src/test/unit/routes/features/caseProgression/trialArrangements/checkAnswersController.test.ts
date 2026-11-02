import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimWithDefendantTrialArrangements} from '../../../../../utils/mockClaimForCheckAnswers';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import * as checkAnswersService from 'services/features/caseProgression/trialArrangements/checkAnswersService';
import trialCheckAnswersController from 'routes/features/caseProgression/trialArrangements/checkAnswersController';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
  CANCEL_TRIAL_ARRANGEMENTS,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {submitTrialArrangement: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaim: jest.fn(),
}));

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  submitTrialArrangement: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockDeleteDraftClaim = deleteDraftClaim as jest.Mock;

const claimId = '1692795793361508';
const viewPath = 'features/caseProgression/trialArrangements/check-answers';

describe('Trial Arrangements check answers', () => {
  const getHandler = getRouteHandler(trialCheckAnswersController, 'get', TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS);
  const postHandler = getRouteHandler(trialCheckAnswersController, 'post', TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS);

  beforeEach(() => {
    jest.clearAllMocks();
    const claim = getClaimWithDefendantTrialArrangements();
    claim.totalClaimAmount = 15000;
    mockGetClaimById.mockResolvedValue(claim);
    civilServiceMethods.submitTrialArrangement.mockResolvedValue(claim);
    mockDeleteDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the summary built from the trial arrangements', async () => {
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, query: {lang: 'en'}, cookies: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION),
        cancelUrl: constructResponseUrlWithIdParams(claimId, CANCEL_TRIAL_ARRANGEMENTS),
        summarySections: expect.objectContaining({sections: expect.any(Array)}),
        caseInfoContents: expect.any(Array),
      }));
      const summary = JSON.stringify(res.render.mock.calls[0][1].summarySections);
      expect(summary).toContain('Changed');
    });

    it('calls next when building the summary fails', async () => {
      const error = new Error('redis failure');
      jest.spyOn(checkAnswersService, 'getSummarySections').mockImplementation(() => {
        throw error;
      });
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('submits the trial arrangements and redirects to confirmation', async () => {
      const claim = getClaimWithDefendantTrialArrangements();
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {params: {id: claimId}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(civilServiceMethods.submitTrialArrangement).toHaveBeenCalledWith(claimId, expect.any(Object), req);
      expect(mockDeleteDraftClaim).toHaveBeenCalledWith(req);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL),
      );
    });

    it('calls next when submission fails', async () => {
      const error = new Error('ccd failure');
      civilServiceMethods.submitTrialArrangement.mockRejectedValue(error);
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
