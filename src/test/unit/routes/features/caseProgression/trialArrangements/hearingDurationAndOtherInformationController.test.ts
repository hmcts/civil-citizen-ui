import {
  DEFENDANT_SUMMARY_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';
import {mockCivilClaim, mockCivilClaimFastTrack, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import civilClaimResponseFastTrackMock from '../../../../../utils/mocks/civilClaimResponseFastTrackMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation');

const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Hearing duration & other info - On GET', () => {
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
      .get(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', claimId))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.TRIAL_DURATION_TRIAL_ARRANGEMENTS.TITLE'));
        expect(res.text).toContain('Other Information');
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    app.locals.draftStoreClient = mockRedisFailure;
    //When
    await testSession
      .get(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Hearing duration & other information - on POST', () => {

  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
  });

  it('should redirect when other information is filled in', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      .send({otherInformation: 'Info put in'})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', '1111'));
      });
  });

  it('should return "Something went wrong" page when nothing filled in', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should save an empty field when only spaces filled in', async () => {
    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      .send({otherInformation: '    '});
    const testClaim = civilClaimResponseFastTrackMock;
    testClaim.case_data.caseProgression.defendantTrialArrangements.otherTrialInformation = '';

    //Then;
    expect(spySave).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(testClaim.case_data));
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    app.locals.draftStoreClient = mockRedisFailure;
    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should redirect to latestUpload screen when is small claim', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', '1111'));
      });
  });
});
