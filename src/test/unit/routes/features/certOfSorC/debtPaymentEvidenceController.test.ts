import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {GA_DEBT_PAYMENT_EVIDENCE_URL} from 'routes/urls';
import {mockNoStatementOfMeans} from '../../../../utils/mockDraftStore';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from "models/claim";

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('CoSorS - defendant Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const claim = new Claim();
  const mockDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

  beforeAll(() => {
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);

    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    claim.id = 'id';
    mockDataFromStore.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      // jest.spyOn(defendantFinalPaymentDateService,'getDefendantResponse').mockReturnValue(Promise.resolve(null));
      await request(app)
        .get(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
  });
});
