import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {PAY_HEARING_FEE_SUCCESSFUL_URL} from 'routes/urls';
import {mockCivilClaimApplicantCompanyType} from '../../../../utils/mockDraftStore';
import {mockCivilClaimHearingFee} from '../../../../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
const spyDel = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore');

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving successful payment page', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing fee');
        });
    });

    it('should return error if there is no case progression data', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;

      spyDel.mockImplementation(() => {return null;});

      await request(app)
        .get(PAY_HEARING_FEE_SUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
