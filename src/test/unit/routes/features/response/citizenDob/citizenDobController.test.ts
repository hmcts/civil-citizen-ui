import {Response} from 'express';
import citizenDobController from 'routes/features/response/citizenDob/citizenDobController';
import {AGE_ELIGIBILITY_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/citizenDob/citizen-dob';
const claimId = '12345';
const adultDob = {year: '1981', month: '1', day: '1'};

const claimWithRespondent = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(citizenDobController, method, DOB_URL)(
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

const postErrors = async (body: Record<string, string>): Promise<string[]> => {
  const {res} = await invoke('post', {body});
  return res.render.mock.calls[0][1].form.getErrors()
    .flatMap((error: {constraints: Record<string, string>}) => Object.values(error.constraints));
};

describe('Citizen date of birth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claimWithRespondent());
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render an empty date of birth page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        today: expect.any(Date),
      }));
      expect(res.render.mock.calls[0][1].form.model.year).toBeUndefined();
    });

    it('should load a stored date of birth string into the form', async () => {
      const claim = claimWithRespondent();
      claim.respondent1.dateOfBirth = '2000-01-02' as unknown as CitizenDate;
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('get');

      expect(res.render.mock.calls[0][1].form.model.day).toBe(2);
      expect(res.render.mock.calls[0][1].form.model.month).toBe(1);
      expect(res.render.mock.calls[0][1].form.model.year).toBe(2000);
    });

    it('should ignore an invalid stored date of birth', async () => {
      const claim = claimWithRespondent();
      claim.respondent1.dateOfBirth = {date: undefined} as unknown as CitizenDate;
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect(res.render.mock.calls[0][1].form.model.year).toBeUndefined();
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the date of birth is blank', async () => {
      const {res} = await invoke('post', {body: {year: '', month: '', day: ''}});

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveDraftClaim).not.toHaveBeenCalled();
    });

    it('should return missing field errors when the date of birth is blank', async () => {
      const errors = await postErrors({year: '', month: '', day: ''});

      expect(errors).toEqual(expect.arrayContaining(['ERRORS.VALID_DAY', 'ERRORS.VALID_MONTH', 'ERRORS.VALID_FOUR_DIGIT_YEAR']));
    });

    it.each([
      ['year is less than 1872', {year: '1871', month: '1', day: '1'}, 'ERRORS.VALID_YEAR'],
      ['date is in the future', {year: '2400', month: '1', day: '1'}, 'ERRORS.VALID_DATE'],
      ['year is 2 digits', {year: '22', month: '1', day: '1'}, 'ERRORS.DOB_VALID_FOUR_DIGIT_YEAR'],
      ['year is more than 4 digits', {year: '12345', month: '1', day: '1'}, 'ERRORS.DOB_VALID_FOUR_DIGIT_YEAR'],
      ['month is invalid', {year: '2000', month: '13', day: '1'}, 'ERRORS.DOB_VALID_MONTH'],
      ['month is 0', {year: '2000', month: '0', day: '1'}, 'ERRORS.DOB_VALID_MONTH'],
      ['day is invalid', {year: '2000', month: '1', day: '32'}, 'ERRORS.DOB_VALID_DAY'],
      ['day is 0', {year: '2000', month: '1', day: '0'}, 'ERRORS.DOB_VALID_DAY'],
      ['date does not exist', {year: '2000', month: '2', day: '31'}, 'ERRORS.DOB_VALID_DAY'],
    ])('should return the date of birth error when %s', async (_case, body, expectedError) => {
      const errors = await postErrors(body);

      expect(errors).toContain(expectedError);
    });

    it.each([
      ['day is 0', {year: '2000', month: '1', day: '0'}],
      ['month is 0', {year: '2000', month: '0', day: '1'}],
      ['date does not exist', {year: '2000', month: '2', day: '31'}],
      ['year is more than 4 digits', {year: '12345', month: '1', day: '1'}],
    ])('should not return the generic valid date error when %s', async (_case, body) => {
      const errors = await postErrors(body);

      expect(errors).not.toContain('ERRORS.VALID_DATE');
    });

    it.each(['0', '00', '000'])('should return date of birth 4-digit year error when year is %s', async (year) => {
      const errors = await postErrors({year, month: '1', day: '1'});

      expect(errors).toContain('ERRORS.DOB_VALID_FOUR_DIGIT_YEAR');
      expect(errors).not.toContain('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should return date of birth day, month and year errors when all are invalid', async () => {
      const errors = await postErrors({year: '0', month: '13', day: '40'});

      expect(errors).toEqual(expect.arrayContaining(['ERRORS.DOB_VALID_DAY', 'ERRORS.DOB_VALID_MONTH', 'ERRORS.DOB_VALID_FOUR_DIGIT_YEAR']));
    });

    it('should keep missing field errors when day and month are empty', async () => {
      const errors = await postErrors({year: '2000', month: '', day: ''});

      expect(errors).toEqual(expect.arrayContaining(['ERRORS.VALID_DAY', 'ERRORS.VALID_MONTH']));
      expect(errors).not.toContain('ERRORS.DOB_VALID_DAY');
      expect(errors).not.toContain('ERRORS.DOB_VALID_MONTH');
    });

    it('should create a respondent and redirect to the phone page when the claim has none', async () => {
      const claim = new Claim();
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('post', {body: adultDob});

      expect(claim.respondent1.dateOfBirth).toBeDefined();
      expect(saveDraftClaim).toHaveBeenCalledWith(claimId, claim);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should redirect an adult without a CCD phone number to the phone page', async () => {
      const {res} = await invoke('post', {body: adultDob});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should redirect an adult with a CCD phone number to the task list', async () => {
      const claim = claimWithRespondent();
      claim.respondent1.partyPhone = new PartyPhone('07700900000', true);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('post', {body: adultDob});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect an under-18 date of birth to the age eligibility page', async () => {
      const {res} = await invoke('post', {body: {year: '2021', month: '1', day: '1'}});

      expect(saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, AGE_ELIGIBILITY_URL));
    });

    it('should return the error when saving the date of birth fails', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: adultDob});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
