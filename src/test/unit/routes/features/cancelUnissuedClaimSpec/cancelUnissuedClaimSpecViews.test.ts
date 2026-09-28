import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {app} from '../../../../../main/app';
import {
  CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_SPEC_URL,
} from 'routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('routes/guards/cancelUnissuedClaimSpecGuard', () => ({
  cancelUnissuedClaimSpecGuard: jest.fn((req, res, next) => next()),
}));

describe('Cancel unissued claim spec views', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claimId = '1234567890123456';

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  it('should render the cancel unissued claim page', async () => {
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_SPEC_URL.replace(':id', claimId));

    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM_SPEC.TITLE'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM_SPEC.GUIDANCE_CANNOT_BE_COURT_PROCEEDINGS'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM_SPEC.BUTTON'));
    expect(res.text).toContain('name="cancelReason"');
    expect(res.text).toContain(`href="/dashboard/${claimId}/claimantNewDesign"`);
  });

  it('should render the confirmation page', async () => {
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL.replace(':id', claimId));

    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM_SPEC.CONFIRMATION_TITLE'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM_SPEC.NO_FURTHER_ACTION'));
    expect(res.text).toContain(t('PAGES.SUBMIT_CONFIRMATION.GO_TO_ACCOUNT'));
  });
});
