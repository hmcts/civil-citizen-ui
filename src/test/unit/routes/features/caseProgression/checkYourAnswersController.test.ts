import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {CP_CHECK_ANSWERS_URL} from 'routes/urls';
import * as checkAnswersService from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {SummarySection, SummarySections} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/caseProgression/checkYourAnswers/checkAnswersService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockSummarySections = checkAnswersService.getSummarySections as jest.Mock;
mockSummarySections.mockReturnValue({} as SummarySections);
const mockDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;

const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

describe('Evidence Upload - checkYourAnswers Controller', () => {
  const civilServiceUrl = config.get<string>('services.civilService.url');
  const idamServiceUrl: string = config.get('services.idam.url');

  const civilClaimResponse = require('../../../../utils/mocks/civilClaimResponseDocumentUploadedMock.json');
  const civilClaimResponseClaimant = require('../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = civilClaimResponse.id;

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
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(civilServiceUrl)
      .get('/cases/defendant/123')
      .reply(200, {data: civilClaimResponse });
    nock(civilServiceUrl)
      .get('/cases/claimant/123')
      .reply(200, {data: civilClaimResponse });
  });

  describe('On Get', () => {
    it('should render page successfully with all sections and summary rows', async () => {
      //Given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValueOnce(claim);
      mockSummarySections.mockImplementation(() => {
        return {sections: [] as SummarySection[]} as SummarySections;
      });

      //When
      await testSession
        .get(CP_CHECK_ANSWERS_URL.replace(':id', claimId)).query({lang: 'en'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Check your answers');
        });
    });
    it('should render page successfully update task list status', async () => {
      //Given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValueOnce(claim);
      mockSummarySections.mockImplementation(() => {
        return {sections: [] as SummarySection[]} as SummarySections;
      });

      //When
      await testSession
        .get(CP_CHECK_ANSWERS_URL.replace(':id', claimId)).query({lang: 'en'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Check your answers');
        });
    });
    it('should render page successfully in Welsh with all sections and summary rows', async () => {
      //Given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValueOnce(claim);
      mockSummarySections.mockImplementation(() => {
        return {sections: [] as SummarySection[]} as SummarySections;
      });

      //When
      await testSession
        .get(CP_CHECK_ANSWERS_URL.replace(':id', claimId)).query({lang: 'cy'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Gwiriwch eich atebion');
        });
    });

    it('should render page successfully with all sections and summary rows when is claimant request', async () => {
      //Given
      const claimantClaim: Claim = new Claim();
      Object.assign(claimantClaim, civilClaimResponseClaimant.case_data);

      mockSummarySections.mockImplementation(() => {
        return {sections: [] as SummarySection[]} as SummarySections;
      });
      mockDraftStore.mockReturnValueOnce(claimantClaim);
      //When
      await testSession
        .get(CP_CHECK_ANSWERS_URL.replace(':id', claimId)).query({lang: 'en'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Check your answers');
        });
    });

    it('should render page successfully with all sections and summary rows when is claimant request', async () => {
      //Given
      const claimantClaim: Claim = new Claim();
      Object.assign(claimantClaim, civilClaimResponseClaimant.case_data);

      mockSummarySections.mockImplementation(() => {
        return {sections: [] as SummarySection[]} as SummarySections;
      });
      mockDraftStore.mockReturnValueOnce(claimantClaim);
      //When
      await testSession
        .get(CP_CHECK_ANSWERS_URL.replace(':id', claimId)).query({lang: 'cy'})
        //Then
        .expect((res: { status: unknown; text: unknown; }) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Gwiriwch eich atebion');
        });
    });

    it('should return status 500 when error thrown', async () => {
      //given
      jest.spyOn(draftStoreService, 'getDraftClaimFromStore')
        .mockImplementation(() => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });

      //when
      await testSession
        .get(CP_CHECK_ANSWERS_URL).query({lang:'en'})
        //then
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('On POST', () => {
    test('If the right form is missing, send back to check your answers page.', async () => {
      //given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValueOnce(claim);

      //when
      await testSession.post(CP_CHECK_ANSWERS_URL).query({lang: 'en'}).expect((res: { status: unknown; text: unknown; }) => {
        //then
        expect(res.status).toBe(200);
        expect(res.text).toContain('Check your answers');
      });
    });

    test('If the right form is missing, send back to check your answers page.', async () => {
      //given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValueOnce(claim);

      //when
      await testSession.post(CP_CHECK_ANSWERS_URL).query({lang: 'cy'}).expect((res: { status: unknown; text: unknown; }) => {
        //then
        expect(res.status).toBe(200);
        expect(res.text).toContain('Gwiriwch eich atebion');
      });
    });

    test('If the right form is missing, send back to check your answers page on claimant request.', async () => {
      //given
      const claim: Claim = new Claim();
      Object.assign(claim, civilClaimResponse.case_data);
      claim.caseRole = CaseRole.CLAIMANT;
      mockDraftStore.mockReturnValueOnce(claim);

      //when
      await testSession.post(CP_CHECK_ANSWERS_URL).query({lang: 'cy'}).expect((res: { status: unknown; text: unknown; }) => {
        //then
        expect(res.status).toBe(200);
        expect(res.text).toContain('Gwiriwch eich atebion');
      });
    });

    test('If the form is not missing, redirect to new page', async () => {
      //given
      const claim: Claim = new Claim();
      Object.assign(civilClaimResponse, mockCivilClaim);
      Object.assign(claim, civilClaimResponse.case_data);
      mockDraftStore.mockReturnValue(claim);
      mockGenerateRedisKey.mockReturnValue('12345');

      //when
      await testSession.post(CP_CHECK_ANSWERS_URL).send({signed: true}).expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain('Found. Redirecting to /case/:id/case-progression/documents-uploaded');
      });
    });
    test('Throw error', async () => {
      //given
      jest.spyOn(draftStoreService, 'getDraftClaimFromStore')
        .mockImplementation(() => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });

      //when
      await testSession.post(CP_CHECK_ANSWERS_URL);
      expect((res: Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });

    });
  });
});
