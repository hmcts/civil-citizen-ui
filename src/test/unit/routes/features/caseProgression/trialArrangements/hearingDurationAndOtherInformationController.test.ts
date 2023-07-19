import {TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

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
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId)
      .reply(200, claim);
    //When
    await testSession
      .get(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', claimId))
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.HEARING_DURATION_TRIAL_ARRANGEMENTS.TITLE'));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + claimId)
      .reply(404, null);
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

  it('should redirect when otherInformation is not filled in', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(TRIAL_ARRANGEMENTS_HEARING_DURATION.replace(':id', '1111'))
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', '1111'));
      });
  });
});
