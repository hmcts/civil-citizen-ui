import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {MediationCarm} from 'models/mediation/mediationCarm';
import mediationUnavailabilitySelectDatesController from 'routes/features/mediation/mediationUnavailabilitySelectDatesController';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';
import {ValidationError} from 'class-validator';
import en from 'modules/i18n/locales/en.json';
import cy from 'modules/i18n/locales/cy.json';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediationCarm: jest.fn(),
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGetMediationCarm = getMediationCarm as jest.Mock;
const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/unavailable-dates-mediation';

const dateParts = (daysAhead: number): {day: string; month: string; year: string} => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
};

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(mediationUnavailabilitySelectDatesController, method, MEDIATION_UNAVAILABLE_SELECT_DATES_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const translate = (locale: Record<string, unknown>, key: string): string =>
  (key.split('.').reduce((value: unknown, part) => (value as Record<string, unknown>)?.[part], locale) as string) ?? key;

const collectConstraints = (errors: ValidationError[] = []): string[] =>
  errors.flatMap((error) => [...Object.values(error.constraints ?? {}), ...collectConstraints(error.children)]);

const postErrors = async (body: Record<string, unknown>, locale: Record<string, unknown> = en): Promise<string[]> => {
  const {res} = await invoke('post', {body});
  return collectConstraints(res.render.mock.calls[0][1].form.errors).map((key) => translate(locale, key));
};

describe('Mediation Unavailability Select Dates Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    mockGetCaseData.mockResolvedValue(claim);
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Mediation unavailability dates page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_TITLE',
        isCarm: true,
      }));
    });

    it('should call next when loading unavailability dates fails', async () => {
      const error = new Error('redis failure');
      mockGetMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant task list with a single date', async () => {
      const {res} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {start: dateParts(1)},
          }],
        },
      });

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, true, 'hasAvailabilityMediationFinished');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the claimant task list with a longer period', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.LONGER_PERIOD,
            period: {start: dateParts(1), end: dateParts(2)},
          }],
        },
      });

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving unavailability dates fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {start: dateParts(1)},
          }],
        },
      });

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST - single date validation', () => {
    const {day, month, year} = dateParts(7);

    const singleDateBody = (start: Record<string, string>) => ({
      items: [{type: UnavailableDateType.SINGLE_DATE, single: {start}}],
    });

    it.each(['0', '00', '000'])('should return 4-digit year error when year is %s', async (invalidYear) => {
      const errors = await postErrors(singleDateBody({day, month, year: invalidYear}));

      expect(errors).toContain('Unavailable date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable must include a year');
    });

    it('should return valid year error when year is 4 digits but before 1872', async () => {
      const errors = await postErrors(singleDateBody({day, month, year: '1500'}));

      expect(errors).toContain('Enter a valid year');
      expect(errors).not.toContain('Unavailable date must include a 4-digit year');
    });

    it('should return valid month error when month is invalid', async () => {
      const errors = await postErrors(singleDateBody({day, month: '13', year}));

      expect(errors).toContain('Unavailable date must include a valid month');
      expect(errors).not.toContain('Date you are unavailable must include a month');
    });

    it('should return valid day error when day is invalid', async () => {
      const errors = await postErrors(singleDateBody({day: '32', month, year}));

      expect(errors).toContain('Unavailable date must include a valid day');
      expect(errors).not.toContain('Date you are unavailable must include a day');
    });

    it('should return valid day error when date does not exist', async () => {
      const errors = await postErrors(singleDateBody({day: '31', month: '2', year}));

      expect(errors).toContain('Unavailable date must include a valid day');
      expect(errors).not.toContain('Enter the date you are unavailable');
    });

    it('should return 4-digit year error when year is more than 4 digits', async () => {
      const errors = await postErrors(singleDateBody({day, month, year: '12345'}));

      expect(errors).toContain('Unavailable date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable must be in the next 3 months');
    });

    it('should return day, month and year errors when all are invalid', async () => {
      const errors = await postErrors(singleDateBody({day: '40', month: '13', year: '0'}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable date must include a valid day',
        'Unavailable date must include a valid month',
        'Unavailable date must include a 4-digit year',
      ]));
    });

    it.each(['0', 'abc'])('should return day, month and year errors when all are %s', async (invalidValue) => {
      const errors = await postErrors(singleDateBody({day: invalidValue, month: invalidValue, year: invalidValue}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable date must include a valid day',
        'Unavailable date must include a valid month',
        'Unavailable date must include a 4-digit year',
      ]));
      expect(errors).not.toContain('Enter the date you are unavailable');
    });

    it('should keep missing field errors when day, month or year are empty', async () => {
      const errors = await postErrors(singleDateBody({day: '', month: '', year}));

      expect(errors).toEqual(expect.arrayContaining([
        'Date you are unavailable must include a day',
        'Date you are unavailable must include a month',
      ]));
      expect(errors).not.toContain('Unavailable date must include a valid day');
      expect(errors).not.toContain('Unavailable date must include a valid month');
    });

    it('should keep missing date error when date is empty', async () => {
      const errors = await postErrors(singleDateBody({day: '', month: '', year: ''}));

      expect(errors).toContain('Enter the date you are unavailable');
    });

    it('should return welsh 4-digit year error when year is invalid', async () => {
      const errors = await postErrors(singleDateBody({day, month, year: '0'}), cy);

      expect(errors).toContain('Rhaid i\'r dyddiad nad ydych ar gael gynnwys blwyddyn 4 digid');
    });

    it('should redirect when single date is valid', async () => {
      const {res} = await invoke('post', {body: singleDateBody({day, month, year})});

      expect(res.redirect).toHaveBeenCalled();
    });
  });

  describe('on POST - longer period from date validation', () => {
    const {day, month, year} = dateParts(7);
    const validEnd = dateParts(14);
    const emptyEnd = {day: '', month: '', year: ''};

    const longerPeriodBody = (start: Record<string, string>, end: Record<string, string> = validEnd) => ({
      items: [{type: UnavailableDateType.LONGER_PERIOD, period: {start, end}}],
    });

    it.each(['0', '00', '000'])('should return from 4-digit year error when year is %s', async (invalidYear) => {
      const errors = await postErrors(longerPeriodBody({day, month, year: invalidYear}));

      expect(errors).toContain('Unavailable from date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable from must include a year');
    });

    it('should return valid year error when from year is 4 digits but before 1872', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '1500'}));

      expect(errors).toContain('Enter a valid year');
      expect(errors).not.toContain('Unavailable from date must include a 4-digit year');
    });

    it('should return from valid month error when month is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day, month: '13', year}));

      expect(errors).toContain('Unavailable from date must include a valid month');
      expect(errors).not.toContain('Date you are unavailable from must include a month');
    });

    it('should return from valid day error when day is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day: '32', month, year}));

      expect(errors).toContain('Unavailable from date must include a valid day');
      expect(errors).not.toContain('Date you are unavailable from must include a day');
    });

    it('should return from valid day error when date does not exist', async () => {
      const errors = await postErrors(longerPeriodBody({day: '31', month: '2', year}));

      expect(errors).toContain('Unavailable from date must include a valid day');
      expect(errors).not.toContain('Enter the date you are unavailable from');
    });

    it('should return from 4-digit year error when year is more than 4 digits', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '12345'}));

      expect(errors).toContain('Unavailable from date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable from must be in the next 3 months');
    });

    it('should return from day, month and year errors when all are invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day: '40', month: '13', year: '0'}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable from date must include a valid day',
        'Unavailable from date must include a valid month',
        'Unavailable from date must include a 4-digit year',
      ]));
    });

    it.each(['0', 'abc'])('should return from day, month and year errors when all are %s', async (invalidValue) => {
      const errors = await postErrors(longerPeriodBody({day: invalidValue, month: invalidValue, year: invalidValue}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable from date must include a valid day',
        'Unavailable from date must include a valid month',
        'Unavailable from date must include a 4-digit year',
      ]));
      expect(errors).not.toContain('Enter the date you are unavailable from');
    });

    it('should keep from missing field errors when day or year are empty', async () => {
      const errors = await postErrors(longerPeriodBody({day: '', month, year: ''}));

      expect(errors).toEqual(expect.arrayContaining([
        'Date you are unavailable from must include a day',
        'Date you are unavailable from must include a year',
      ]));
      expect(errors).not.toContain('Unavailable from date must include a valid day');
      expect(errors).not.toContain('Unavailable from date must include a 4-digit year');
    });

    it('should keep missing from date error when from date is empty', async () => {
      const errors = await postErrors(longerPeriodBody({day: '', month: '', year: ''}));

      expect(errors).toContain('Enter the date you are unavailable from');
    });

    it('should return from and to errors when from date is invalid and to date is empty', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '0'}, emptyEnd));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable from date must include a 4-digit year',
        'Enter the date you are unavailable to',
      ]));
    });

    it('should keep from date before to date error', async () => {
      const errors = await postErrors(longerPeriodBody(validEnd, {day, month, year}));

      expect(errors).toContain('Date you are unavailable from must be before the date you are unavailable to');
    });

    it('should return welsh from 4-digit year error when year is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '0'}), cy);

      expect(errors).toContain('Rhaid i ddim ar gael o\'r dyddiad hwn ymlaen gynnwys blwyddyn 4 digid');
    });

    it('should redirect when longer period is valid', async () => {
      const {res} = await invoke('post', {body: longerPeriodBody({day, month, year})});

      expect(res.redirect).toHaveBeenCalled();
    });
  });

  describe('on POST - longer period to date validation', () => {
    const validStart = dateParts(7);
    const {day, month, year} = dateParts(14);

    const longerPeriodBody = (end: Record<string, string>, start: Record<string, string> = validStart) => ({
      items: [{type: UnavailableDateType.LONGER_PERIOD, period: {start, end}}],
    });

    it.each(['0', '00', '000'])('should return to 4-digit year error when year is %s', async (invalidYear) => {
      const errors = await postErrors(longerPeriodBody({day, month, year: invalidYear}));

      expect(errors).toContain('Unavailable to date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable to must include a year');
      expect(errors).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
    });

    it('should return to valid day error when to date does not exist', async () => {
      const errors = await postErrors(longerPeriodBody({day: '31', month: '2', year}));

      expect(errors).toContain('Unavailable to date must include a valid day');
      expect(errors).not.toContain('Enter the date you are unavailable to');
      expect(errors).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
    });

    it('should return to 4-digit year error when year is more than 4 digits', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '12345'}));

      expect(errors).toContain('Unavailable to date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable to must be in the next 3 months');
      expect(errors).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
    });

    it('should return valid year error when to year is 4 digits but before 1872', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '1500'}));

      expect(errors).toContain('Enter a valid year');
      expect(errors).not.toContain('Unavailable to date must include a 4-digit year');
      expect(errors).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
    });

    it('should return to valid month error when month is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day, month: '13', year}));

      expect(errors).toContain('Unavailable to date must include a valid month');
      expect(errors).not.toContain('Date you are unavailable to must include a month');
    });

    it('should return to valid day error when day is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day: '32', month, year}));

      expect(errors).toContain('Unavailable to date must include a valid day');
      expect(errors).not.toContain('Date you are unavailable to must include a day');
    });

    it('should return to day, month and year errors when all are invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day: '40', month: '13', year: '0'}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable to date must include a valid day',
        'Unavailable to date must include a valid month',
        'Unavailable to date must include a 4-digit year',
      ]));
    });

    it.each(['0', 'abc'])('should return to day, month and year errors when all are %s', async (invalidValue) => {
      const errors = await postErrors(longerPeriodBody({day: invalidValue, month: invalidValue, year: invalidValue}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable to date must include a valid day',
        'Unavailable to date must include a valid month',
        'Unavailable to date must include a 4-digit year',
      ]));
      expect(errors).not.toContain('Enter the date you are unavailable to');
    });

    it('should keep to missing field errors when day or year are empty', async () => {
      const errors = await postErrors(longerPeriodBody({day: '', month, year: ''}));

      expect(errors).toEqual(expect.arrayContaining([
        'Date you are unavailable to must include a day',
        'Date you are unavailable to must include a year',
      ]));
      expect(errors).not.toContain('Unavailable to date must include a valid day');
      expect(errors).not.toContain('Unavailable to date must include a 4-digit year');
    });

    it('should keep missing to date error when to date is empty', async () => {
      const errors = await postErrors(longerPeriodBody({day: '', month: '', year: ''}));

      expect(errors).toContain('Enter the date you are unavailable to');
    });

    it('should return from and to errors independently when both are invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day, month: '13', year}, {...validStart, year: '0'}));

      expect(errors).toEqual(expect.arrayContaining([
        'Unavailable from date must include a 4-digit year',
        'Unavailable to date must include a valid month',
      ]));
    });

    it('should return welsh to 4-digit year error when year is invalid', async () => {
      const errors = await postErrors(longerPeriodBody({day, month, year: '0'}), cy);

      expect(errors).toContain('Rhaid i ddim ar gael hyd at y dyddiad hwn gynnwys blwyddyn 4 digid');
    });
  });
});
