import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {DEFENDANT_SUMMARY_URL, HAS_ANYTHING_CHANGED_URL, IS_CASE_READY_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {YesNo} from 'form/models/yesNo';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import civilClaimResponseFastTrackMock from '../../../../../utils/mocks/civilClaimResponseFastTrackMock.json';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Is case ready - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });

  it('should render page successfully in English if cookie has correct values', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
    });
    //When
    await testSession
      .get(IS_CASE_READY_URL.replace(':id', claimId))
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Is the case ready for trial?');
      });
  });

  it('should render page successfully in Welsh when query is cy and cookie has correct values', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
    });
    //When
    await testSession
      .get(IS_CASE_READY_URL.replace(':id', claimId)).query({lang: 'cy'})
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('A yw’r achos yn barod ar gyfer treial?');
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //When
    await testSession
      .get(IS_CASE_READY_URL.replace(':id', '1111')).query({lang: 'en'})
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Is case ready - on POST', () => {
  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
    });
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });
  it('should display error when neither Yes nor No were selected', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(IS_CASE_READY_URL.replace(':id', '1111'))
      .send({})
    //Then
      .expect((res: {status: unknown, text: unknown}) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'));
      });
  });

  it('should redirect to "Has anything changed" page when one option is selected', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(IS_CASE_READY_URL.replace(':id', '1111'))
      .send({option: YesNo.NO})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(HAS_ANYTHING_CHANGED_URL.replace(':id', '1111'));
      });
  });

  it('should redirect to latestUpload screen when is small claim', async () => {

    //Given
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseMock.case_data);
    });
    //When
    await testSession
      .post(IS_CASE_READY_URL.replace(':id', '1111'))
      .send({option: YesNo.NO})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', '1111'));
      });
  });

});

