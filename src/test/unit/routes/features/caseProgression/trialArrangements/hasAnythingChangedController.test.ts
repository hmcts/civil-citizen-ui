import {
  mockCivilClaim,
  mockCivilClaimFastTrack, mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {DEFENDANT_SUMMARY_URL, HAS_ANYTHING_CHANGED_URL, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {YesNo} from 'form/models/yesNo';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Has anything changed - On GET', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
  });
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully if cookie has correct values', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    //When
    await testSession
      .get(HAS_ANYTHING_CHANGED_URL.replace(':id', claimId))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.HAS_ANYTHING_CHANGED.PAGE_TITLE'));
      });
  });

  it('should redirect to latestUpload screen when is small claim', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .get(HAS_ANYTHING_CHANGED_URL.replace(':id', claimId))
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    app.locals.draftStoreClient = mockRedisFailure;
    //When
    await testSession
      .get(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });

  });
});

describe('Has anything changed - on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
  });

  it('should display error when neither Yes nor No were selected', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      .send({})
      //Then
      .expect((res: {status: unknown, text: unknown}) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'));
      });
  });

  it('should display error when Yes was selected, but the textArea was not filled', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      .send({option: YesNo.YES})
      //Then
      .expect((res: {status: unknown, text: unknown}) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.VALID_ENTER_SUPPORT'));
      });
  });

  it('should redirect to "Hearing duration" page when No is selected', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      .send({option: YesNo.NO})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'));
      });
  });

  it('should redirect to "Hearing duration" page when Yes is selected and textArea is filled', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      .send({option: YesNo.YES, textArea: 'some text'})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'));
      });
  });

  it('should redirect to latestUpload screen when is small claim', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      .send({option: YesNo.YES, textArea: 'some text'})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', '1111'));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    app.locals.draftStoreClient = mockRedisFailure;
    //When
    await testSession
      .post(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
