import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  GA_APPLY_HELP_WITH_FEE_REFERENCE,
  GA_APPLY_HELP_WITH_FEES_START
} from 'routes/urls';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));

describe('General Application - Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Apply for help with fees page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES_START)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Apply for help with fees');
          expect(res.text).toContain('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.');
          expect(res.text).toContain('Instead, you should make a new help with fees application which will provide you with a new reference number');
          expect(res.text).toContain('During your application, you will be asked for the number of your court or tribunal form.');
          expect(res.text).toContain('Once you have made your application, return to this page and click continue to proceed.');
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES_START)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEE_REFERENCE);
        });
    });
  });
});
