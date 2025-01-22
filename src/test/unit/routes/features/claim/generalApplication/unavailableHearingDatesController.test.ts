import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_UNAVAILABLE_HEARING_DATES_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import { isGaForLipsEnabled } from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../../../utils/dateUtils';
import {getUnavailableDatesForHearingForm} from 'services/features/generalApplication/unavailableHearingDatesService';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/services/features/generalApplication/unavailableHearingDatesService');
const getUnavailableDatesHearingFormMock = getUnavailableDatesForHearingForm as jest.Mock;

describe('General Application - Unavailable hearing dates', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(GA_UNAVAILABLE_HEARING_DATES_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(GA_UNAVAILABLE_HEARING_DATES_URL)
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
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on box selected but date input incomplete', async () => {
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return new UnavailableDatesGaHearing(
          [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
            {'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
        );
      });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return errors when no information is provided', async () => {
      const unavailableDates = new UnavailableDatesGaHearing(
        [new UnavailableDatePeriodGaHearing(undefined,
          {'day': undefined, 'month': undefined, 'year': undefined})],
      );
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return unavailableDates;
      });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_SINGLE_DATE_OR_PERIOD'));
        });
    });

    it('should add another period if add another clicked', async () => {
      const unavailableDates = new UnavailableDatesGaHearing(
        [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
          {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
      );
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return unavailableDates;
      });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send({action: 'add_another-unavailableDates'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
      // Ensure new row added
      expect(unavailableDates.items.length).toEqual(2);
    });

    it('should remove period if remove button clicked', async () => {
      const unavailableDates = new UnavailableDatesGaHearing(
        [new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
          {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()})],
      );
      getUnavailableDatesHearingFormMock.mockImplementation(() => {
        return unavailableDates;
      });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send({action: 'remove-unavailableDates0'})
        .expect((res) => {
          expect(res.status).toBe(200);
        });
      // Ensure row 0 removed
      expect(unavailableDates.items.length).toEqual(0);
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(GA_UNAVAILABLE_HEARING_DATES_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
