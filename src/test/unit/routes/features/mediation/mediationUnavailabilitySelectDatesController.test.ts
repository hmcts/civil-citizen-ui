import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';
import {UnavailableDatePeriodMediation} from 'models/mediation/unavailableDatesMediation';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../../utils/dateUtils';
import {CaseState} from 'form/models/claimDetails';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/features/mediation/unavailableDatesForMediationService');

const CONTROLLER_URL = MEDIATION_UNAVAILABLE_SELECT_DATES_URL;
describe('Mediation Unavailability Select Dates Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const getUnavailableDatesMediationFormMock = getUnavailableDatesMediationForm as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = {phone: '111111'};
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      return claim;
    });
  });

  describe('on GET', () => {
    it('should return Mediation unavailability dates page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.MEDIATION_UNAVAILABILITY_DATES);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST - claimant response', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = new Party();
        claim.applicant1.partyPhone = {phone: '111111'};
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });
    });

    it('should redirect to task list with single date', async () => {
      //given
      getUnavailableDatesMediationFormMock.mockImplementation(() => {
        const mockRequest: Record<string, any[]> = {
          'items': [{
            'type': UnavailableDateType.SINGLE_DATE,
            'single': {
              'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
            },
          }],
        };
        const mockItem = mockRequest['items'][0];
        return new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, mockItem.single.start);
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          // expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to task list with Long period date', async () => {
      //given
      const currentDatePlusOne = new Date();
      currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);
      getUnavailableDatesMediationFormMock.mockImplementation(() => {
        const mockRequest: Record<string, any[]> = {
          'items': [{
            'type': UnavailableDateType.LONGER_PERIOD,
            'period': {
              'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
              'end': {'day': currentDatePlusOne.getDate(), 'month': currentDatePlusOne.getMonth() + 1, 'year': currentDatePlusOne.getFullYear()},
            },
          }],
        };
        const mockItem = mockRequest['items'][0];
        return new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD, mockItem.period.start, mockItem.period.end);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'yes'})
        .expect((res) => {
          // expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });
  });

  describe('on POST - single date validation', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const day = String(futureDate.getDate());
    const month = String(futureDate.getMonth() + 1);
    const year = String(futureDate.getFullYear());

    const singleDateBody = (start: Record<string, string>) => ({
      items: [{type: UnavailableDateType.SINGLE_DATE, single: {start}}],
    });

    beforeEach(() => {
      const {getUnavailableDatesMediationForm: actualGetForm} = jest.requireActual('services/features/mediation/unavailableDatesForMediationService');
      getUnavailableDatesMediationFormMock.mockImplementation(actualGetForm);
    });

    it.each(['0', '00', '000'])('should return 4-digit year error when year is %s', async (invalidYear) => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day, month, year: invalidYear}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable date must include a 4-digit year');
          expect(res.text).not.toContain('Date you are unavailable must include a year');
        });
    });

    it('should return valid year error when year is 4 digits but before 1872', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day, month, year: '1500'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a valid year');
          expect(res.text).not.toContain('Unavailable date must include a 4-digit year');
        });
    });

    it('should return valid month error when month is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day, month: '13', year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable date must include a valid month');
          expect(res.text).not.toContain('Date you are unavailable must include a month');
        });
    });

    it('should return valid day error when day is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day: '32', month, year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable date must include a valid day');
          expect(res.text).not.toContain('Date you are unavailable must include a day');
        });
    });

    it('should return day, month and year errors when all are invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day: '40', month: '13', year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable date must include a valid day');
          expect(res.text).toContain('Unavailable date must include a valid month');
          expect(res.text).toContain('Unavailable date must include a 4-digit year');
        });
    });

    it('should keep missing field errors when day, month or year are empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day: '', month: '', year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date you are unavailable must include a day');
          expect(res.text).toContain('Date you are unavailable must include a month');
          expect(res.text).not.toContain('Unavailable date must include a valid day');
          expect(res.text).not.toContain('Unavailable date must include a valid month');
        });
    });

    it('should keep missing date error when date is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day: '', month: '', year: ''}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter the date you are unavailable');
        });
    });

    it('should return welsh 4-digit year error when year is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .query({lang: 'cy'})
        .send(singleDateBody({day, month, year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Rhaid i&#39;r dyddiad nad ydych ar gael gynnwys blwyddyn 4 digid');
        });
    });

    it('should redirect when single date is valid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(singleDateBody({day, month, year}))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });

  describe('on POST - longer period from date validation', () => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() + 7);
    const day = String(fromDate.getDate());
    const month = String(fromDate.getMonth() + 1);
    const year = String(fromDate.getFullYear());
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 14);
    const validEnd = {day: String(toDate.getDate()), month: String(toDate.getMonth() + 1), year: String(toDate.getFullYear())};
    const emptyEnd = {day: '', month: '', year: ''};

    const longerPeriodBody = (start: Record<string, string>, end: Record<string, string> = validEnd) => ({
      items: [{type: UnavailableDateType.LONGER_PERIOD, period: {start, end}}],
    });

    beforeEach(() => {
      const {getUnavailableDatesMediationForm: actualGetForm} = jest.requireActual('services/features/mediation/unavailableDatesForMediationService');
      getUnavailableDatesMediationFormMock.mockImplementation(actualGetForm);
    });

    it.each(['0', '00', '000'])('should return from 4-digit year error when year is %s', async (invalidYear) => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year: invalidYear}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a 4-digit year');
          expect(res.text).not.toContain('Date you are unavailable from must include a year');
        });
    });

    it('should return valid year error when from year is 4 digits but before 1872', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year: '1500'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a valid year');
          expect(res.text).not.toContain('Unavailable from date must include a 4-digit year');
        });
    });

    it('should return from valid month error when month is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month: '13', year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a valid month');
          expect(res.text).not.toContain('Date you are unavailable from must include a month');
        });
    });

    it('should return from valid day error when day is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '32', month, year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a valid day');
          expect(res.text).not.toContain('Date you are unavailable from must include a day');
        });
    });

    it('should return from day, month and year errors when all are invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '40', month: '13', year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a valid day');
          expect(res.text).toContain('Unavailable from date must include a valid month');
          expect(res.text).toContain('Unavailable from date must include a 4-digit year');
        });
    });

    it('should keep from missing field errors when day or year are empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '', month, year: ''}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date you are unavailable from must include a day');
          expect(res.text).toContain('Date you are unavailable from must include a year');
          expect(res.text).not.toContain('Unavailable from date must include a valid day');
          expect(res.text).not.toContain('Unavailable from date must include a 4-digit year');
        });
    });

    it('should keep missing from date error when from date is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '', month: '', year: ''}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter the date you are unavailable from');
        });
    });

    it('should return from and to errors when from date is invalid and to date is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year: '0'}, emptyEnd))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a 4-digit year');
          expect(res.text).toContain('Enter the date you are unavailable to');
        });
    });

    it('should keep from date before to date error', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody(validEnd, {day, month, year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date you are unavailable from must be before the date you are unavailable to');
        });
    });

    it('should return welsh from 4-digit year error when year is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .query({lang: 'cy'})
        .send(longerPeriodBody({day, month, year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Rhaid i ddim ar gael o&#39;r dyddiad hwn ymlaen gynnwys blwyddyn 4 digid');
        });
    });

    it('should redirect when longer period is valid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year}))
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
  });

  describe('on POST - longer period to date validation', () => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() + 7);
    const validStart = {day: String(fromDate.getDate()), month: String(fromDate.getMonth() + 1), year: String(fromDate.getFullYear())};
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 14);
    const day = String(toDate.getDate());
    const month = String(toDate.getMonth() + 1);
    const year = String(toDate.getFullYear());

    const longerPeriodBody = (end: Record<string, string>, start: Record<string, string> = validStart) => ({
      items: [{type: UnavailableDateType.LONGER_PERIOD, period: {start, end}}],
    });

    beforeEach(() => {
      const {getUnavailableDatesMediationForm: actualGetForm} = jest.requireActual('services/features/mediation/unavailableDatesForMediationService');
      getUnavailableDatesMediationFormMock.mockImplementation(actualGetForm);
    });

    it.each(['0', '00', '000'])('should return to 4-digit year error when year is %s', async (invalidYear) => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year: invalidYear}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable to date must include a 4-digit year');
          expect(res.text).not.toContain('Date you are unavailable to must include a year');
          expect(res.text).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
        });
    });

    it('should return enter to date error when to date does not exist', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '31', month: '2', year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter the date you are unavailable to');
          expect(res.text).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
        });
    });

    it('should return valid year error when to year is 4 digits but before 1872', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month, year: '1500'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter a valid year');
          expect(res.text).not.toContain('Unavailable to date must include a 4-digit year');
          expect(res.text).not.toContain('Date you are unavailable from must be before the date you are unavailable to');
        });
    });

    it('should return to valid month error when month is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month: '13', year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable to date must include a valid month');
          expect(res.text).not.toContain('Date you are unavailable to must include a month');
        });
    });

    it('should return to valid day error when day is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '32', month, year}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable to date must include a valid day');
          expect(res.text).not.toContain('Date you are unavailable to must include a day');
        });
    });

    it('should return to day, month and year errors when all are invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '40', month: '13', year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable to date must include a valid day');
          expect(res.text).toContain('Unavailable to date must include a valid month');
          expect(res.text).toContain('Unavailable to date must include a 4-digit year');
        });
    });

    it('should keep to missing field errors when day or year are empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '', month, year: ''}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date you are unavailable to must include a day');
          expect(res.text).toContain('Date you are unavailable to must include a year');
          expect(res.text).not.toContain('Unavailable to date must include a valid day');
          expect(res.text).not.toContain('Unavailable to date must include a 4-digit year');
        });
    });

    it('should keep missing to date error when to date is empty', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day: '', month: '', year: ''}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter the date you are unavailable to');
        });
    });

    it('should return from and to errors independently when both are invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .send(longerPeriodBody({day, month: '13', year}, {...validStart, year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Unavailable from date must include a 4-digit year');
          expect(res.text).toContain('Unavailable to date must include a valid month');
        });
    });

    it('should return welsh to 4-digit year error when year is invalid', async () => {
      await request(app)
        .post(CONTROLLER_URL)
        .query({lang: 'cy'})
        .send(longerPeriodBody({day, month, year: '0'}))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Rhaid i ddim ar gael hyd at y dyddiad hwn gynnwys blwyddyn 4 digid');
        });
    });
  });

  describe('on POST - defendant response', () => {
    it('should redirect to task list with single date', async () => {
      //given
      getUnavailableDatesMediationFormMock.mockImplementation(() => {
        const mockRequest: Record<string, any[]> = {
          'items': [{
            'type': UnavailableDateType.SINGLE_DATE,
            'single': {
              'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
            },
          }],
        };
        const mockItem = mockRequest['items'][0];
        return new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, mockItem.single.start);
      });

      await request(app)
        .post(CONTROLLER_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to task list with Long period date', async () => {
      //given
      const currentDatePlusOne = new Date();
      currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);
      getUnavailableDatesMediationFormMock.mockImplementation(() => {
        const mockRequest: Record<string, any[]> = {
          'items': [{
            'type': UnavailableDateType.LONGER_PERIOD,
            'period': {
              'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
              'end': {'day': currentDatePlusOne.getDate(), 'month': currentDatePlusOne.getMonth() + 1, 'year': currentDatePlusOne.getFullYear()},
            },
          }],
        };
        const mockItem = mockRequest['items'][0];
        return new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD, mockItem.period.start, mockItem.period.end);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
