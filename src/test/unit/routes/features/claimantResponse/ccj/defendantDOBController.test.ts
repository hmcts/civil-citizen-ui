import {Response} from 'express';
import defendantDOBController from 'routes/features/claimantResponse/ccj/defendantDOBController';
import {CCJ_DEFENDANT_DOB_URL, CCJ_PAID_AMOUNT_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/ccj/defendant-dob';
const claimId = '12345';
const paidAmountUrl = constructResponseUrlWithIdParams(claimId, CCJ_PAID_AMOUNT_URL);

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(defendantDOBController, method, CCJ_DEFENDANT_DOB_URL)(
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

const expectErrors = (res: ReturnType<typeof createMockResponse>) => {
  expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
    pageTitle: 'PAGES.CCJ_DEFENDANT_DOB.PAGE_TITLE',
  }));
  expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
  expect(res.redirect).not.toHaveBeenCalled();
};

describe('CCJ - Defendant`s date of birth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Defendant`s date of birth', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CCJ_DEFENDANT_DOB.PAGE_TITLE',
        maxDateForAge18: expect.any(Date),
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error on empty post', async () => {
      const {res} = await invoke('post');

      expectErrors(res);
    });

    it('should return error on empty dob', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES, dob: {day: '', month: '', year: ''}}});

      expectErrors(res);
    });

    it('should return error on current year - 150 years', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES, dob: {day: '', month: '', year: '1800'}}});

      expectErrors(res);
    });

    it('should return error 4 digit year', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES, dob: {day: '', month: '', year: '555'}}});

      expectErrors(res);
    });

    it('should return error with dob less then 18', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES, dob: {day: '11', month: '11', year: '2021'}}});

      expectErrors(res);
    });

    it('should redirect to paid amount if option yes is selected with valid date', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES, dob: {day: '11', month: '11', year: '2000'}}});

      expect(saveClaimantResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(paidAmountUrl);
    });

    it('should redirect to paid amount page if option no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(res.redirect).toHaveBeenCalledWith(paidAmountUrl);
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.NO}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
