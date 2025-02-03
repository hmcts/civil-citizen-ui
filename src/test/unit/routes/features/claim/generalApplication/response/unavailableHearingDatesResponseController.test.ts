import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {isGaForLipsEnabled} from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../../../../utils/dateUtils';
import {getUnavailableDatesForHearingForm} from 'services/features/generalApplication/unavailableHearingDatesService';
import * as utilityService from 'modules/utilityService';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';
import { Claim } from 'common/models/claim';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/utilityService');
jest.mock('../../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../../main/services/features/generalApplication/unavailableHearingDatesService');

jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

const mockGetClaim = utilityService.getClaimById as jest.Mock;
const getUnavailableDatesHearingFormMock = getUnavailableDatesForHearingForm as jest.Mock;
describe('General Application Response- Unavailable hearing dates', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  beforeEach(() => {
    const mockClaim = new Claim();
    mockClaim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];
    mockGetClaim.mockResolvedValueOnce(mockClaim);

  });
  describe('on GET', () => {
    it('should return page', async () => {
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValueOnce(mockGaResponse);
      await request(app)
        .get(constructResponseUrlWithIdAndAppIdParams('123', '345',GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockRejectedValueOnce(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .get(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
            {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
        );
      });
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
      await request(app)
        .post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors when no information is provided', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(undefined,
            {'day': undefined, 'month': undefined, 'year': undefined})],
        );
      });
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
      await request(app)
        .post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_SINGLE_DATE_OR_PERIOD'));
        });
    });

    it('should send action add_another-unavailableDates', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
            {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
        );
      });
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
      await request(app)
        .post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .send({'action': 'add_another-unavailableDates'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should send action remove-unavailableDates', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
            {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
        );
      });
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
      await request(app)
        .post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .send({'action': 'remove-unavailableDates'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return errors on box selected but date input incomplete', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
            {'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
        );
      });
      const mockGaResponse = new GaResponse();
      mockGaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockResolvedValue(mockGaResponse);
      await request(app)
        .post(constructResponseUrlWithIdAndAppIdParams('123', '345',GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL))
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      jest.spyOn(gaStoreResponseService, 'getDraftGARespondentResponse').mockRejectedValue(new Error(TestMessages.SOMETHING_WENT_WRONG));
      await request(app)
        .post(GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
