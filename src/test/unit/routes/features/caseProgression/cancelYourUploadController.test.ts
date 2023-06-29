import {
  mockCivilClaim,
} from '../../../../utils/mockDraftStore';
import {CP_EVIDENCE_UPLOAD_CANCEL, CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {YesNo} from 'form/models/yesNo';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const civilServiceUrl = config.get<string>('services.civilService.url');
const testSession = session(app);

describe('Cancel document upload - On GET', () => {
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
      .get(CP_EVIDENCE_UPLOAD_CANCEL.replace(':id', claimId))
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE'));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(404, null);
    //When
    await testSession
      .get(CP_EVIDENCE_UPLOAD_CANCEL.replace(':id', '1111'))
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Cancel document upload - on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });
  it('should display error when neither Yes nor No were selected', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(CP_EVIDENCE_UPLOAD_CANCEL.replace(':id', '1111'))
      .send({})
    //Then
      .expect((res: {status: unknown, text: unknown}) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.VALID_YES_NO_OPTION_NAC_YDW'));
      });
  });

  it('should redirect to upload-documents page', async () => {

    //Given
    nock(civilServiceUrl)
      .post(CIVIL_SERVICE_CASES_URL + '1111')
      .reply(200, claimId);

    //When
    await testSession
      .post(CP_EVIDENCE_UPLOAD_CANCEL.replace(':id', '1111'))
      .send({option: YesNo.NO})
      //Then
      .expect((res: {status: unknown, header: {location: unknown}}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CP_UPLOAD_DOCUMENTS_URL.replace(':id', '1111'));
      });
  });
});

