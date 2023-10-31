import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CONFIRMATION_URL} from '../../../../../main/routes/urls';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {Party} from '../../../../../main/common/models/party';
import {CaseRole} from 'form/models/caseRoles';
import { ResponseType } from 'common/form/models/responseType';
import { PaymentOptionType } from 'common/form/models/admission/paymentOption/paymentOptionType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockClaim = new Claim();
mockClaim.respondent1ResponseDate = new Date();
mockClaim.applicant1 = new Party();
mockClaim.applicant1 = {
  type: PartyType.INDIVIDUAL,
  partyDetails: {
    partyName: 'Joe Bloggs',
  },
};

describe('Submit confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const responsePaymentDeadlineDate = '2023-11-06';

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, civilClaimResponseMock);
    nock('http://localhost:4000')
      .get('/cases/:id/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
    nock('http://localhost:4000')
      .get('/cases/response/deadline')
      .reply(200, responsePaymentDeadlineDate);

  });
  describe('on GET', () => {
    it('should return submit confirmation from claim', async () => {
      mockGetCaseData.mockImplementation(() => mockClaim);
      nock('http://localhost:4000')
        .get('/cases/:id')
        .reply(200, civilClaimResponseMock);
      nock('http://localhost:4000')
        .get('/cases/:id/userCaseRoles')
        .reply(200, [CaseRole.APPLICANTSOLICITORONE]);
      await request(app)
        .get(CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You&#39;ve submitted your response');
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      await request(app)
        .get(CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
    it('should return submit confirmation from claim', async () => {
      mockGetCaseData.mockImplementation(() => mockClaim);
      mockClaim.respondent1 = {
        responseType: ResponseType.FULL_ADMISSION,
      };
      mockClaim.fullAdmission = {
        paymentIntention:{
          paymentOption: PaymentOptionType.IMMEDIATELY,
        },
      };
      mockClaim.respondent1ResponseDate = new Date('2023-10-31T15:48:15');
      nock('http://localhost:4000')
        .get('/cases/:id')
        .reply(200, civilClaimResponseMock);
      await request(app)
        .get(CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You&#39;ve submitted your response');
        });
    });
  });
});
