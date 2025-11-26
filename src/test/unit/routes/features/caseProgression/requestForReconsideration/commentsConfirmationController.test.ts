import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {
  REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
} from 'routes/urls';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {mockCivilClaimFastTrack} from '../../../../../utils/mockDraftStore';
import {CaseRole} from 'form/models/caseRoles';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');
jest.mock('services/features/dashboard/claimSummaryService');
jest.mock('services/caseDocuments/documentService');
jest.mock('services/features/caseProgression/bundles/bundlesService');

describe('Request for reconsideration comments confirmation page test', () => {
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamUrl: string = config.get('idamUrl');
  
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return expected page in English when claim exists', async () => {
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
        .get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL.replace(':id', claimId))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('A judge will now review the order and the comments.');
        });
    });

    it('should return expected page in Welsh when claim exists with Welsh cookie', async () => {
      //Given
      app.request.cookies = {lang: 'cy'};
      app.locals.draftStoreClient = mockCivilClaimFastTrack;
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId + '/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      //When
      await testSession
        .get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL.replace(':id', claimId))
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Bydd barnwr nawr yn adolygu’r gorchymyn a’r sylwadau.');
        });
    });

  });
});
