import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL, RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';
import {UnavailableDatePeriodMediation} from 'models/mediation/unavailableDatesMediation';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../../utils/dateUtils';

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

  describe('on POST', () => {
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
