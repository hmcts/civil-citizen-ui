import request from 'supertest';
import {app} from '../../../../../main/app';
import config from 'config';
import {CITIZEN_DETAILS_URL, CONFIRM_CITIZEN_DETAILS_URL, DOB_URL} from '../../../../../main/routes/urls';
import {CLAIM_ID, CONFIRM_YOUR_DETAILS} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {UrlPatchReplace} from '../../../../../main/common/utils/urlPatchReplace';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
const nock = require('nock');

const agent = request.agent(app);

function authenticate() {
  return () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res) => {
        expect(res.status).toBe(302);
      });
}

const mockResponse = {
  legacyCaseReference: '497MC585',
  applicant1:
    {
      type: 'INDIVIDUAL',
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
    },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: '2022-01-24T15:59:59',
  detailsOfClaim: 'the reason i have given',
};

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    authenticate();
    nock('http://localhost:4000')
      .get(UrlPatchReplace.replaceIDFromUrl(CITIZEN_DETAILS_URL, CLAIM_ID))
      .reply(200, {mockResponse});
  });

  test('should return your details page', async () => {
    const mockDraftStore = {
      get: jest.fn(() => Promise.resolve()),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await agent
      .get(UrlPatchReplace.replaceIDFromUrl(CITIZEN_DETAILS_URL, CLAIM_ID))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(CONFIRM_YOUR_DETAILS);
      });

  });

  test('Authenticate Callback', authenticate());
  test('POST/Citizen details', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({data: {}})),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await agent
      .post(UrlPatchReplace.replaceIDFromUrl(CONFIRM_CITIZEN_DETAILS_URL,CLAIM_ID))
      .send({addressLineOne: '38 Highland Road', city: 'Birmingham'})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain((UrlPatchReplace.replaceIDFromUrl(DOB_URL,CLAIM_ID)));
      });
  });
});
