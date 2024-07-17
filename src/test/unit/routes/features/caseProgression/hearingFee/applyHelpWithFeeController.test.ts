import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import civilClaimResponseHearingFeeMock from '../../../../../utils/mocks/civilClaimResponseHearingFeeMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Apply for help with fees', () => {
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
  describe('on GET', () => {
    it('should return resolving apply help fees page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseHearingFeeMock.case_data);
      });
      await request(app)
        .get(APPLY_HELP_WITH_FEES_START)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Apply for Help with Fees (open in a new window)');
          expect(res.text).toContain('Hearing');
          expect(res.text).toContain('Apply for help with fees');
          expect(res.text).toContain('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
          expect(res.text).toContain('Instead, you should make a new help');
          expect(res.text).toContain('During your application, you');
          expect(res.text).toContain('Once you have made your application, return');
        });
    });
  });

  describe('on POST', () => {

    it('should redirect to help with fee selection if continue', async () => {
      await request(app)
        .post(APPLY_HELP_WITH_FEES_START)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(APPLY_HELP_WITH_FEES_REFERENCE);
        });
    });
  });
});
