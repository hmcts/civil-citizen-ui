import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');

describe('Claim Party Type Controller', () => {
  // TODO: Update test after refactoring controller to get and save to DraftStore
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render claimant party type selection page successfully', async () => {
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as INDIVIDUAL', async () => {
      app.request['cookies'] = {'claim_issue_journey': {claimantPartyType: PartyType.INDIVIDUAL}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as SOLE_TRADER', async () => {
      app.request['cookies'] = {'claim_issue_journey': {claimantPartyType: PartyType.SOLE_TRADER}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as COMPANY', async () => {
      app.request['cookies'] = {'claim_issue_journey': {claimantPartyType: PartyType.COMPANY}};
      const res = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should render claimant party type selection page with set cookie value as ORGANISATION', async () => {
      app.request['cookies'] = {'claim_issue_journey': {claimantPartyType: PartyType.ORGANISATION}};
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
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': PartyType.INDIVIDUAL}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_INDIVIDUAL_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(PartyType.INDIVIDUAL);
      });
    });

    it('should render claimant sole trader details page when radio "A sole trader or self-employed person" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': PartyType.SOLE_TRADER}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_SOLE_TRADER_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(PartyType.SOLE_TRADER);
      });
    });

    it('should render claimant company details page when radio "A limited company" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': PartyType.COMPANY}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_COMPANY_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(PartyType.COMPANY);
      });
    });

    it('should render claimant organisation details page when radio "Another type of organisation" is selected', async () => {
      await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL).send({'option': PartyType.ORGANISATION}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIMANT_ORGANISATION_DETAILS_URL);
        expect(app.request.cookies.claim_issue_journey.claimantPartyType).toBe(PartyType.ORGANISATION);
      });
    });
  });
});
