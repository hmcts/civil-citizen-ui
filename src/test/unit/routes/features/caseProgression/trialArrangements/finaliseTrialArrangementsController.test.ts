import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {t} from 'i18next';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import Module from 'module';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockCivilClaimFastTrack, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {CaseRole} from 'form/models/caseRoles';
import {DocumentType} from 'models/document/documentType';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));

describe('"finalise trial arrangements" page test', () => {
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  claim.case_data.systemGeneratedCaseDocuments= [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.DEFENDANT_DEFENCE,
        documentLink:  {
          document_url: 'url1',
          document_filename: 'filename1',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.SDO_ORDER,
        documentLink: {
          document_url: 'url1',
          document_filename: 'filename1',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    }];
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

  beforeAll((done) => {
    testSession
      .get('/oauth2/callback')
      .query('code=ABC')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  describe('on GET', () => {
    it('should return expected page when claim exists', async () => {
      //Given
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
      //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE'));
        });
    });

    it('should redirect to latestUpload screen when is small claim', async () => {
      //Given
      app.locals.draftStoreClient = mockCivilClaim;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId))
      //Then
        .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
        });
    });

    it('should return "Something went wrong" page when claim does not exist', async () => {
      //Given
      app.locals.draftStoreClient = mockRedisFailure;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + '1111')
        .reply(404, null);
      //When
      await testSession
        .get(CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', '1111'))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});

