import {Response} from 'express';
import agreedResponseDeadlineController from 'routes/features/response/responseDeadline/agreedResponseDeadlineController';
import {AGREED_TO_MORE_TIME_URL, NEW_RESPONSE_DEADLINE_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ResponseDeadline} from 'form/models/responseDeadline';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/responseDeadline/agreed-response-deadline';
const claimId = '12345';
const originalDeadline = new Date('2050-05-15T02:59:59');

const storedClaim = (agreedDate?: Date): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      title: 'Mr',
      firstName: 'James',
      lastName: 'Bond',
    },
  };
  claim.respondent1ResponseDeadline = originalDeadline;
  if (agreedDate) {
    claim.responseDeadline = Object.assign(new ResponseDeadline(), {
      agreedResponseDeadline: agreedDate,
    });
  }
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(agreedResponseDeadlineController, method, AGREED_TO_MORE_TIME_URL)(
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

describe('Agreed response date', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render an empty agreed response date page', async () => {
      const claim = storedClaim();
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: claim.getClaimantFullName(),
        today: expect.any(Date),
        isReleaseTwoEnabled: true,
      }));
      expect(res.render.mock.calls[0][1].form.model).toBeUndefined();
    });

    it('should load the agreed date stored on the claim', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim(new Date(2025, 5, 1)));

      const {res} = await invoke('get');

      expect(res.render.mock.calls[0][1].form.model.year).toBe(2025);
      expect(res.render.mock.calls[0][1].form.model.month).toBe(6);
      expect(res.render.mock.calls[0][1].form.model.day).toBe(1);
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the agreed date is blank', async () => {
      const {res} = await invoke('post', {body: {year: '', month: '', day: ''}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the agreed date is more than 28 days after the original deadline', async () => {
      const {res} = await invoke('post', {body: {year: '2050', month: '6', day: '13'}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save the 28th day after the original deadline and redirect', async () => {
      const {res} = await invoke('post', {body: {year: '2050', month: '6', day: '12'}});

      expect(saveDraftClaim).toHaveBeenCalled();
      const saved = (saveDraftClaim as jest.Mock).mock.calls[0][1] as Claim;
      const agreedDate = (saved.responseDeadline as unknown as {agreedResponseDeadline?: Date}).agreedResponseDeadline;
      expect(agreedDate).toEqual(expect.any(Date));
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, NEW_RESPONSE_DEADLINE_URL));
    });

    it('should return the error when saving the agreed date fails', async () => {
      const error = new Error('redis failure');
      (saveDraftClaim as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {year: '2050', month: '6', day: '12'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
