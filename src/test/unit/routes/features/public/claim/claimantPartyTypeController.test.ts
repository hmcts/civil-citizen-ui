import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import { CounterpartyType } from '../../../../../../main/common/models/counterpartyType';
import {
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');

describe('Signposting Controller', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should render claimant party type selection page successfully', async () => {
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as INDIVIDUAL', async () => {
      app.request['cookies'] = {'claim_issue_journey': { claimantPartyType: CounterpartyType.INDIVIDUAL}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as SOLE_TRADER', async () => {
      app.request['cookies'] = {'claim_issue_journey': { claimantPartyType: CounterpartyType.SOLE_TRADER}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as COMPANY', async () => {
      app.request['cookies'] = {'claim_issue_journey': { claimantPartyType: CounterpartyType.COMPANY}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as ORGANISATION', async () => {
      app.request['cookies'] = {'claim_issue_journey': { claimantPartyType: CounterpartyType.ORGANISATION}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });
  });

  describe('on POST', () => {
    it('should render error message when claiming as is not selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('There was a problem');
      });
    });

    it('should render claimant individual details page when radio "An individual" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': CounterpartyType.INDIVIDUAL }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_INDIVIDUAL_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(CounterpartyType.INDIVIDUAL);
      });
    });

    it('should render claimant sole trader details page when radio "A sole trader or self-employed person" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': CounterpartyType.SOLE_TRADER }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_SOLE_TRADER_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(CounterpartyType.SOLE_TRADER);
      });
    });

    it('should render claimant company details page when radio "A limited company" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': CounterpartyType.COMPANY }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_COMPANY_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(CounterpartyType.COMPANY);
      });
    });

    it('should render claimant organisation details page when radio "Another type of organisation" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': CounterpartyType.ORGANISATION }).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_ORGANISATION_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(CounterpartyType.ORGANISATION);
      });
    });
  });
});
