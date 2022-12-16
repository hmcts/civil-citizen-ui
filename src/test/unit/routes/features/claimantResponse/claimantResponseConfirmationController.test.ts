import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';

import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {Party} from '../../../../../main/common/models/party';
import {CLAIMANT_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockClaim = new Claim();
mockClaim.respondent1ResponseDate = new Date();
mockClaim.claimantResponse = new ClaimantResponse();
mockClaim.claimantResponse.intentionToProceed = {option: 'no'};
mockClaim.respondent1 = new Party();
mockClaim.respondent1 = {
  type: PartyType.INDIVIDUAL,
  partyDetails: {
    partyName: 'Joe Bloggs',
  },
};

describe('Claimant response confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, civilClaimResponseMock);
  });
  describe('on GET', () => {
    it('should return claimant response confirmation claim', async () => {
      mockGetCaseData.mockImplementation(() => mockClaim);
      nock('http://localhost:4000')
        .get('/cases/:id')
        .reply(200, civilClaimResponseMock);
      const res = await request(app).get(CLAIMANT_RESPONSE_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain("You didn't proceed with the claim");
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => mockRedisFailure);
      const res = await request(app).get(CLAIMANT_RESPONSE_CONFIRMATION_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
