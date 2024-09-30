import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {
  GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_DEBT_PAYMENT_EVIDENCE_COSC_URL, GA_UPLOAD_DOCUMENTS_COSC_URL,

} from 'routes/urls';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {
  getCertificateOfSatisfactionOrCancellation,
} from 'services/features/generalApplication/certOfSorC/certificateOfSatisfactionOrCancellationService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/certOfSorC/certificateOfSatisfactionOrCancellationService');
const mockGetCertificateOfSatisfactionOrCancellation = getCertificateOfSatisfactionOrCancellation as jest.Mock;

describe('General Application - CoSorC - debt payment evidence controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  const claim = new Claim();

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);

  });

  beforeEach(() => {
    claim.id = 'id';
    mockGetCertificateOfSatisfactionOrCancellation.mockReturnValue(claim);
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL.replace(':id', claim.id))
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

  });
  describe('on POST', () => {
    it('should return error on page for no evidence chosen', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL.replace(':id', claim.id))
        .send({evidence: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'));
        });
    });

    it('should return error on page for no details written', async () => {
      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.NO_EVIDENCE})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.UNABLE_TO_PROVIDE_EVIDENCE);
        });
    });

    it('should return upload docs page', async () => {

      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.UPLOAD_EVIDENCE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_UPLOAD_DOCUMENTS_COSC_URL.replace(':id', claim.id));
        });
    });

    it('should return check your answers page', async () => {

      await request(app)
        .post(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL.replace(':id', claim.id))
        .send({evidence: debtPaymentOptions.NO_EVIDENCE, provideDetails: 'some evidence'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_CHECK_YOUR_ANSWERS_COSC_URL.replace(':id', claim.id));
        });
    });
  });
});
