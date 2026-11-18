import {Response} from 'express';
import confirmYouHaveBeenPaidController from 'routes/features/judgmentOnline/confirmYouHaveBeenPaidController';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
  DASHBOARD_CLAIMANT_URL,
  VIEW_THE_JUDGMENT_URL,
} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {GenericForm} from 'form/models/genericForm';
import {DateYouHaveBeenPaidForm} from 'form/models/judmentOnline/confirmYouHaveBeenPaidForm';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    submitJudgmentPaidInFull: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  submitJudgmentPaidInFull: jest.Mock;
};

const viewPath = 'features/judgmentOnline/confirm-you-have-been-paid';
const claimId = '1645882162449409';

const buildClaim = (caseRole = CaseRole.CLAIMANT): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.caseRole = caseRole;
  claim.joJudgementByAdmissionIssueDate = new Date('2020-01-15');
  return claim;
};

const invoke = async (method: 'get' | 'post', overrides: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(confirmYouHaveBeenPaidController, method, CONFIRM_YOU_HAVE_BEEN_PAID_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {lang: 'en'},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...overrides,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const renderedForm = (res: ReturnType<typeof createMockResponse>): GenericForm<DateYouHaveBeenPaidForm> => {
  expect(res.redirect).not.toHaveBeenCalled();
  expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
    pageTitle: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.PAGE_TITLE',
    claimId,
    cancelUrl: DASHBOARD_CLAIMANT_URL.replace(':id', claimId),
  }));
  return res.render.mock.calls[0][1].form as GenericForm<DateYouHaveBeenPaidForm>;
};

const errorTexts = (form: GenericForm<DateYouHaveBeenPaidForm>): string[] =>
  form.getAllErrors().map((error: {text: string}) => error.text);

describe('Confirm you have been paid', () => {
  let claim: Claim;

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    civilServiceMethods.submitJudgmentPaidInFull.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the form for the claimant and clears the draft', async () => {
      const {res} = await invoke('get');
      const form = renderedForm(res);

      expect(form.hasErrors()).toBe(false);
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
      expect(getClaimById).toHaveBeenCalledWith(claimId, expect.anything(), true);
      const view = res.render.mock.calls[0][1] as {iWantToLinks: Array<{url: string}>; dashboardUrl: string};
      expect(view.dashboardUrl).toBe(DASHBOARD_CLAIMANT_URL.replace(':id', claimId));
      expect(view.iWantToLinks[0].url).toBe(VIEW_THE_JUDGMENT_URL.replace(':id', claimId));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {res, next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });

    it('calls next when the logged-in user is the defendant', async () => {
      (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.DEFENDANT));

      const {res, next} = await invoke('get');

      expect(res.render).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('on POST', () => {
    const validBody = {day: '2', month: '3', year: '2020', confirmed: true};

    it('redirects to confirmation when the date is valid', async () => {
      const {res} = await invoke('post', {body: validBody});

      expect(civilServiceMethods.submitJudgmentPaidInFull).toHaveBeenCalledWith(
        claimId,
        expect.objectContaining({
          joJudgmentPaidInFull: expect.objectContaining({
            dateOfFullPaymentMade: expect.any(Date),
            confirmFullPaymentMade: ['CONFIRMED'],
          }),
        }),
        expect.anything(),
      );
      expect(deleteDraftClaimFromStore).toHaveBeenCalledWith(claimId);
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL),
      );
      expect(res.render).not.toHaveBeenCalled();
    });

    it('re-renders when the confirmation checkbox is not checked', async () => {
      const {res} = await invoke('post', {body: {day: '2', month: '3', year: '2020'}});
      const form = renderedForm(res);

      expect(form.hasFieldError('confirmed')).toBe(true);
      expect(form.errorFor('confirmed')).toBe('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.CHECK_ERROR_MESSAGE');
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('re-renders when the date is blank', async () => {
      const {res} = await invoke('post', {body: {day: '', month: '', year: '', confirmed: true}});
      const form = renderedForm(res);

      expect(form.hasFieldError('day')).toBe(true);
      expect(form.hasFieldError('month')).toBe(true);
      expect(form.hasFieldError('year')).toBe(true);
      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('re-renders when the year is not four digits', async () => {
      const {res} = await invoke('post', {body: {day: '2', month: '3', year: '202', confirmed: true}});
      const form = renderedForm(res);

      expect(form.hasFieldError('year')).toBe(true);
      expect(errorTexts(form)).toContain('ERRORS.VALID_FOUR_DIGIT_YEAR');
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('re-renders when the date is not a real calendar date', async () => {
      const {res} = await invoke('post', {body: {day: '31', month: '2', year: '1998', confirmed: true}});
      const form = renderedForm(res);

      expect(form.hasFieldError('date')).toBe(true);
      expect(errorTexts(form)).toContain('ERRORS.VALID_DATE');
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('re-renders when the date is in the future', async () => {
      const today = new Date();
      const {res} = await invoke('post', {body: {
        day: String(today.getDate()),
        month: String(today.getMonth() + 1),
        year: String(today.getFullYear() + 1),
        confirmed: true,
      }});
      const form = renderedForm(res);

      expect(errorTexts(form)).toContain('ERRORS.CORRECT_DATE_NOT_IN_FUTURE');
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('re-renders when the date is before the judgment', async () => {
      claim.joJudgementByAdmissionIssueDate = new Date('2020-06-15');

      const {res} = await invoke('post', {body: validBody});
      const form = renderedForm(res);

      expect(errorTexts(form)).toContain('ERRORS.VALID_PAID_IN_FULL_DATE');
      expect(res.redirect).not.toHaveBeenCalled();
      expect(civilServiceMethods.submitJudgmentPaidInFull).not.toHaveBeenCalled();
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {res, next} = await invoke('post', {body: validBody});

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('calls next when the logged-in user is the defendant', async () => {
      (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.DEFENDANT));

      const {res, next} = await invoke('post', {body: validBody});

      expect(res.render).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
