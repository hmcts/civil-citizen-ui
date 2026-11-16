import {Response} from 'express';
import datePaidViewController from 'routes/features/claimantResponse/paidInFull/datePaidController';
import {DATE_PAID_CONFIRMATION_URL, DATE_PAID_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    submitClaimSettled: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  submitClaimSettled: jest.Mock;
};

const viewPath = 'features/claimantResponse/paidInFull/date-paid';
const claimId = '12345';

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.datePaid = new CitizenDate('2', '3', '1980');
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(datePaidViewController, method, DATE_PAID_URL)(
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

describe('Date Paid Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    civilServiceMethods.submitClaimSettled.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render date paid page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_SETTLE_DATE.PAGE_TITLE',
        today: expect.any(Date),
      }));
    });

    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should render date paid page if there are form errors', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(civilServiceMethods.submitClaimSettled).not.toHaveBeenCalled();
    });

    it('should redirect to the confirmation page', async () => {
      const {res} = await invoke('post', {body: {day: '2', month: '3', year: '1980'}});

      expect(saveClaimantResponse).toHaveBeenCalled();
      expect(civilServiceMethods.submitClaimSettled).toHaveBeenCalledWith(
        claimId,
        {applicant1ClaimSettledDate: expect.any(Date)},
        expect.anything(),
      );
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DATE_PAID_CONFIRMATION_URL));
    });

    it('should return http 500 when has error in the post method', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {day: '4', month: '5', year: '1952'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
