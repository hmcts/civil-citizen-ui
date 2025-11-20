import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {
  REQUEST_FOR_RECONSIDERATION_URL, REQUEST_FOR_RECONSIDERATION_CYA_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Request for Review - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully in English if cookie has correct values', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .get(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', claimId))
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('How and why do you want the order changed?');
      });
  });

  it('should render page successfully in Welsh when query is cy and cookie has correct values', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .get(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', claimId)).query({lang: 'cy'})
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Cais i adolygu’r gorchymyn');
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    app.locals.draftStoreClient = mockRedisFailure;
    //When
    await testSession
      .get(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', '1111')).query({lang: 'en'})
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Request for Review - on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });

  it('should redirect to "Check your answers" page when click continue', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(REQUEST_FOR_RECONSIDERATION_URL.replace(':id', '1111'))
      .send({textArea: 'Changes requested'})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(REQUEST_FOR_RECONSIDERATION_CYA_URL.replace(':id', '1111'));
      });
  });
});
