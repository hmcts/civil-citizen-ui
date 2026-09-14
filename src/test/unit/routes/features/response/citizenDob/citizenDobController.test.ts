import {Response} from 'express';
import citizenDobController from '../../../../../../main/routes/features/response/citizenDob/citizenDobController';
import {
  AGE_ELIGIBILITY_URL,
  CITIZEN_PHONE_NUMBER_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Citizen date of birth', () => {
  const getHandler = getRouteHandler(citizenDobController, 'get');
  const postHandler = getRouteHandler(citizenDobController, 'post');
  const viewPath = 'features/response/citizenDob/citizen-dob';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

  const claimWithRespondent = (phone?: PartyPhone): Claim => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    if (phone) {
      claim.respondent1.partyPhone = phone;
    }
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseData.mockResolvedValue(claimWithRespondent());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render date of birth page empty when there is no information on redis', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        today: expect.any(Date),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.day).not.toBe(NaN);
    });

    it('should render date of birth page with information from redis', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render saved date of birth when it is stored as a string', async () => {
      const claim = claimWithRespondent();
      claim.respondent1.dateOfBirth = '2000-01-02' as never;
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form;
      expect(form.model.day).toBe(2);
      expect(form.model.month).toBe(1);
      expect(form.model.year).toBe(2000);
    });

    it('should not render NaN when date of birth from redis is invalid', async () => {
      const claim = claimWithRespondent();
      claim.respondent1.dateOfBirth = {date: undefined} as never;
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.day).not.toBe(NaN);
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should create a new respondent if redis gives an empty claim', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      req.body = {year: '2000', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should re-render on no input', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should re-render on year less than 1872', async () => {
      req.body = {year: '1871', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('year')).toBe('ERRORS.VALID_YEAR');
    });

    it('should re-render on empty year', async () => {
      req.body = {year: '', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should re-render on future date', async () => {
      req.body = {year: '2400', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('dateOfBirth')).toBe('ERRORS.VALID_DATE');
    });

    it('should re-render on 2 digit year', async () => {
      req.body = {year: '22', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should accept a valid input', async () => {
      req.body = {year: '2000', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect to under 18 contact court page', async () => {
      req.body = {year: '2021', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, AGE_ELIGIBILITY_URL));
    });

    it('should redirect to under 18 contact court page when has information on redis', async () => {
      mockGetCaseData.mockResolvedValue(claimWithRespondent());
      req.body = {year: '2021', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, AGE_ELIGIBILITY_URL));
    });

    it('should redirect to phone number page on valid DOB', async () => {
      req.body = {year: '1981', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should redirect to phone number page on valid DOB when respondent is missing', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      req.body = {year: '1981', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {year: '1981', month: '1', day: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    describe('Redirect to phone-number or task-list screen', () => {
      it('should redirect to task-list screen if phone-number provided', async () => {
        mockGetCaseData.mockResolvedValue(claimWithRespondent(new PartyPhone('01234567890', true)));
        req.body = {year: '1981', month: '1', day: '1'};

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      });

      it('should redirect to phone-number screen if phone-number NOT provided', async () => {
        mockGetCaseData.mockResolvedValue(claimWithRespondent());
        req.body = {year: '1981', month: '1', day: '1'};

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
      });

      it('should redirect to phone-number screen if phone-number is empty', async () => {
        mockGetCaseData.mockResolvedValue(claimWithRespondent(new PartyPhone('')));
        req.body = {year: '1981', month: '1', day: '1'};

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
      });

      it('should redirect to phone-number screen if ccd phone number exist is false', async () => {
        mockGetCaseData.mockResolvedValue(claimWithRespondent(new PartyPhone('01234567890', false)));
        req.body = {year: '1981', month: '1', day: '1'};

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
      });
    });
  });
});
