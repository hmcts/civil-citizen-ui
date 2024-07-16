import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_FEE_CHANGE_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getDraftClaimData} from 'services/dashboard/draftClaimService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/dashboard/draftClaimService.ts');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const getData = getDraftClaimData as jest.Mock;
const civilServiceUrl = config.get<string>('services.civilService.url');

describe('Claim Fee Change Controller Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should claim fee page with no draft claim data', async () => {
      //Given
      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence : 8000});

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: undefined,
      });
      //When
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);
      //Then
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain('testOcmcUrl');
    });

    it('should claim fee page with claim data', async () => {
      //Given
      nock(civilServiceUrl)
        .get('/fees/claim/110')
        .reply(200, {calculatedAmountInPence : 8000});

      getData.mockResolvedValue({
        claimCreationUrl: 'testOcmcUrl',
        draftClaim: {
          claimId: 'draftClaim',
        },
      });

      //When
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CLAIM_FEE_CHANGE_URL);
      //Then
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim fee has changed');
      expect(res.text).toContain(CLAIMANT_TASK_LIST_URL);
    });

    it('should return http 500 when has error in the get method', async () => {
      //Given
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await request(app)
        .get(CLAIM_FEE_CHANGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
