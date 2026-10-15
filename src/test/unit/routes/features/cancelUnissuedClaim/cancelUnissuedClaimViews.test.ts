import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {app} from '../../../../../main/app';
import {
  CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_URL,
} from 'routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('routes/guards/cancelUnissuedClaimGuard', () => ({
  cancelUnissuedClaimGuard: jest.fn((req, res, next) => next()),
}));

describe('Cancel unissued claim views', () => {
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
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_URL.replace(':id', claimId));

    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.TITLE'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.WARNING'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.REASON_LABEL'));
    expect(res.text).toContain('You can enter up to 200 characters');
    expect(res.text).toContain('data-maxlength="200"');
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.BUTTON'));
    expect(res.text).toContain('name="cancelReason"');
    expect(res.text).toContain(`href="/dashboard/${claimId}/claimantNewDesign"`);
  });

  it('should give the character count Welsh messages when the page is in Welsh', async () => {
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_URL.replace(':id', claimId) + '?lang=cy');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Mae gennych %{count} nod yn weddill');
    expect(res.text).toContain('Mae gennych %{count} nod yn ormod');
    expect(res.text).toContain('Mae gennych 0 nod yn weddill');
    expect(res.text).not.toContain('characters remaining');
  });

  it('should show the error summary and field error when the reason is invalid', async () => {
    const res = await request(app)
      .post(CANCEL_UNISSUED_CLAIM_URL.replace(':id', claimId))
      .send({cancelReason: 'Placeholder input text***'});

    expect(res.status).toBe(200);
    expect(res.text).toContain(t('ERRORS.THERE_WAS_A_PROBLEM'));
    expect(res.text.match(new RegExp(t('ERRORS.CANCEL_UNISSUED_CLAIM_REASON_INVALID_CHARACTERS'), 'g'))).toHaveLength(2);
    expect(res.text).toContain('Placeholder input text***');
  });

  it('should render the confirmation page', async () => {
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL.replace(':id', claimId));

    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.CONFIRMATION_TITLE'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.NO_FURTHER_ACTION'));
    expect(res.text).toContain(t('PAGES.SUBMIT_CONFIRMATION.GO_TO_ACCOUNT'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.START_NEW_CLAIM'));
    expect(res.text).not.toContain(t('COMMON.CONTACT_US_FOR_HELP.TITLE'));
    expect(res.text).toContain(t('PAGES.CANCEL_UNISSUED_CLAIM.SURVEY_LINK'));
  });

  it('should render the confirmation page in Welsh', async () => {
    const res = await request(app).get(CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL.replace(':id', claimId) + '?lang=cy');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Mae&#39;r hawliad hwn bellach wedi&#39;i ganslo');
    expect(res.text).toContain('Beth oeddech chi&#39;n ei feddwl o&#39;r gwasanaeth hwn? (yn agor mewn tab newydd)');
    expect(res.text).toContain('Ni ellir cymryd unrhyw gamau pellach ar yr achos hwn gan ei fod bellach wedi&#39;i ganslo.');
  });
});
