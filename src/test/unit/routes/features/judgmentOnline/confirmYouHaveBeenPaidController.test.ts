import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {
  mockCivilClaim,
  mockCivilClaimDefendantCaseProgression,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation');

const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Confirm you have been paid', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('Confirm you have been paid - On GET', () => {

    it('should render page successfully if cookie has correct values', async () => {
    //Given
      app.locals.draftStoreClient = mockCivilClaim;
      //When
      await testSession
        .get(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', claimId))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_PAGE_TITLE);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_ENTER_THE_DATE);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_HINT);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_JUDGMENT_LINK);
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
      app.locals.draftStoreClient = mockRedisFailure;
      //When
      await testSession
        .get(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1111'))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return "Something went wrong" page when the logged-in user is the defendant', async () => {
    //Given
      app.locals.draftStoreClient = mockCivilClaimDefendantCaseProgression;
      //When
      await testSession
        .get(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('Confirm you have been paid - on POST', () => {

    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should redirect to the Confirm you have been paid Confirmation page', async () => {
    //Given
      const today = new Date();
      const month = today.getMonth() <12 ? today.getMonth() + 1 : 1;
      const day = 28;
      const year = today.getFullYear()-1;
      claim.case_data.joJudgementByAdmissionIssueDate = `${year}-${month}-${day}`;

      const CivilServiceClientServiceMock = jest
        .spyOn(CivilServiceClient.prototype, 'submitJudgmentPaidInFull')
        .mockReturnValue(
          new Promise((resolve) => resolve(claim),
          ),
        );
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:day, month:month, year: year, confirmed:true})
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL.replace(':id', '1645882162449409'));
          expect(CivilServiceClientServiceMock).toBeCalled();
        });
    });

    it('should validate checkbox when not checked', async () => {
    //Given
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:2, month:3, year: 2024, confirm:false })
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.CONFIRM_YOU_HAVE_BEEN_PAID_CHECK_ERROR_MESSAGE);
        });
    });

    it('should show error if date is before the judgment by admission date', async () => {
    //Given
      const today = new Date();
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      const month = today.getMonth() <12 ? today.getMonth() + 1 : 1;
      const day = 28;
      const year = today.getFullYear()-1;
      const joIssueDate =   `${year}-${month}-${day}`;

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:20, month:month, year: year, confirmed:true, joIssueDate})
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_PAID_IN_FULL_DATE);
        });
    });

    it('should show error if date is in the future', async () => {
      //Given
      const today = new Date();
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      const month = today.getMonth() == 0 ? today.getMonth() + 1 : 1;
      const day = today.getDay() == 0 ? today.getDay() + 1 : 1;
      const year = today.getFullYear();
      const nextYear = year+1;
      const joIssueDate =   `${year}-${month}-${day-1}`;

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:day, month:month, year: nextYear, confirmed:true, joIssueDate: joIssueDate})
        //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ERRORS_CORRECT_DATE_NOT_IN_FUTURE);
        });
    });

    it('should show errors if date not present', async () => {
    //Given
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ confirmed:true })
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
        });
    });

    it('should show errors if year is not correct', async () => {
    //Given
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:2, month:3, year: 202, confirmed:true })
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });

    it('should show errors if date is not valid', async () => {
    //Given
      nock(civilServiceUrl)
        .post(CIVIL_SERVICE_CASES_URL + '1645882162449409')
        .reply(200, claimId);

      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1645882162449409'))
        .send({ day:null, month:2, year:1998, confirmed:true })
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ERRORS_VALID_DATE);
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
      app.locals.draftStoreClient = mockRedisFailure;
      //When
      await testSession
        .post(CONFIRM_YOU_HAVE_BEEN_PAID_URL.replace(':id', '1234'))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

  });
});
