import {app} from '../../../../../main/app';
import config from 'config';
import Module from 'module';
import {CIVIL_SERVICE_CASES_URL} from 'client/civilServiceUrls';
import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseState} from 'form/models/claimDetails';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimSummaryContent, ClaimSummaryType} from 'form/models/claimSummarySection';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getCaseProgressionHearingMock} from '../../../../utils/caseProgression/mockCaseProgressionHearing';
import {DocumentType} from 'models/document/documentType';

const nock = require('nock');
const session = require('supertest-session');
const citizenRoleToken: string = config.get('citizenRoleToken');
const testSession = session(app);
const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;
const getLatestUpdateContentMock = getLatestUpdateContent as jest.Mock;

jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/dashboard/claimSummary/latestUpdateService');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
let claim : any;
let claimId: number;
describe('Claim Summary Controller Defendant', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  let claimWithSdo: any;

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

  beforeEach(() => {
    claim = 'a';
    claimWithSdo = 1;
    claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    claimId = claim.id;
    claimWithSdo = require('../../../../utils/mocks/civilClaimResponseMock.json');;
    claimWithSdo.state = CaseState.AWAITING_APPLICANT_INTENTION;
  });

  const mockClaimSummaryContent: ClaimSummaryContent = {
    contentSections: [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: 'Test Title',
        },
      },
    ],
    hasDivider: true,
  };

  describe('on GET', () => {
    it('should return evidence upload content when flag is enabled and hasSDODocument', async () => {
      //given
      claimWithSdo.case_data.systemGeneratedCaseDocuments.push(    {
        id: '1',
        'value': {
          'createdBy': 'Civil',
          'documentLink': {
            'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
            'document_filename': 'sealed_claim_form_000MC001.pdf',
            'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
          },
          'documentName': 'sealed_claim_form_000MC001.pdf',
          'documentSize': 45794,
          'documentType': DocumentType.SDO_ORDER,
          'createdDatetime': new Date('2022-06-21T14:15:19'),
        },
      });
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Upload documents');
        });
    });

    it('should not return evidence upload content when flag is disabled', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(false);
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
        });
    });

    it('should not return evidence upload content when flag is enabled and no hasSDODocument', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claim);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).toContain('latest-update');
        });
    });

    it('should not return evidence upload content when flag is enabled and hasSDODocument but latestUpdateContent not empty', async () => {
      //given
      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      getLatestUpdateContentMock.mockReturnValue(mockClaimSummaryContent);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
        });
    });

    it('should return status 500 when error thrown', async () => {
      //given
      isCaseProgressionV1EnableMock.mockRejectedValue(new Error('Mocked error'));
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithSdo);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should show case progression hearing latest Update', async () => {
      //given
      const caseProgressionHearing = getCaseProgressionHearingMock();
      const claimWithHeringDocs = {
        ...claim,
        state: CaseState.AWAITING_APPLICANT_INTENTION,
        case_data: {
          ...claim.case_data,
          hearingDate: caseProgressionHearing.hearingDate,
          hearingLocation: caseProgressionHearing.hearingLocation,
          hearingTimeHourMinute: caseProgressionHearing.hearingTimeHourMinute,
          hearingDocuments: caseProgressionHearing.hearingDocuments,
        },
      };

      isCaseProgressionV1EnableMock.mockResolvedValue(true);
      getLatestUpdateContentMock.mockReturnValue([]);
      //when
      nock(civilServiceUrl)
        .get(CIVIL_SERVICE_CASES_URL + claimId)
        .reply(200, claimWithHeringDocs);
      //then
      await testSession
        .get(`/dashboard/${claimId}/defendant`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).not.toContain('Upload documents');
          expect(res.text).toContain('A hearing has been scheduled for your case');
        });
    });

  });
});
