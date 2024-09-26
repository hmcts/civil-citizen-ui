import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CHECK_YOUR_ANSWERS_COSC_URL, GA_DEBT_PAYMENT_EVIDENCE_URL, UPLOAD_DOCUMENT_COSC_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {isGaForLipsEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as utilityService from 'modules/utilityService';
import {t} from 'i18next';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {debtPaymentEvidenceService} from 'services/features/generalApplication/certOfSorC/debtPaymentEvidenceService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/modules/utilityService');
const mockGetClaimById = utilityService.getClaimById as jest.Mock;
const mockIsGaForLipsEnabled = isGaForLipsEnabled as jest.Mock;

describe('CoSorC - debt payment evidence controller', () => {
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
  describe('on POST', () => {
    it('should return error on page for no evidence chosen', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'));
        });
    });

    it('should return error on page for no details written', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.NO_EVIDENCE})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.UNABLE_TO_PROVIDE_EVIDENCE);
        });
    });

    it('should return upload docs page', async () => {
      jest.spyOn(debtPaymentEvidenceService,'saveDebtPaymentEvidence').mockReturnValue(Promise.resolve(null));

      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.UPLOAD_EVIDENCE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(UPLOAD_DOCUMENT_COSC_URL.replace(':id', claim.id));
        });
    });

    it('should return check your answers page', async () => {
      jest.spyOn(debtPaymentEvidenceService,'saveDebtPaymentEvidence').mockReturnValue(Promise.resolve(null));

      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.NO_EVIDENCE, provideDetails: 'some evidence'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CHECK_YOUR_ANSWERS_COSC_URL.replace(':id', claim.id));
        });
    });
  });
});
