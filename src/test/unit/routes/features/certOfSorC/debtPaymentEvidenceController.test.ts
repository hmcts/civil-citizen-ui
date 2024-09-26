import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CAN_WE_USE_URL, GA_DEBT_PAYMENT_EVIDENCE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {isGaForLipsEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as utilityService from 'modules/utilityService';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/modules/utilityService');
const mockGetClaimById = utilityService.getClaimById as jest.Mock;
const mockIsGaForLipsEnabled = isGaForLipsEnabled as jest.Mock;

describe('CoSorS - defendant Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const claim = new Claim();

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockIsGaForLipsEnabled.mockResolvedValue(true);

  });

  beforeEach(() => {
    claim.id = 'id';
    mockGetClaimById.mockReturnValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

  });
  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'));
        });
    });

    it('should return page', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: 'yes' , provideDetails: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          //expect(res.header.location).toEqual(CAN_WE_USE_URL);
        });
    });
  });
});
