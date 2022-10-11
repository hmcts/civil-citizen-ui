import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
} from '../../../../../../main/routes/urls';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from '../../../../../../main/common/models/claim';
import {Respondent} from '../../../../../../main/common/models/respondent';
import {PartyType} from '../../../../../../main/common/models/partyType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockSaveData = {
  partyName: 'Bob Ltd',
  contactPerson: 'Louise',
  primaryAddressLine1: 'Fake Org',
  primaryAddressLine2: 'Somewhere undefined',
  primaryAddressLine3: 'Floor 4',
  primaryCity: 'Valid city',
  primaryPostCode: 'SN12RA',
};

describe('Defendant details controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    describe('Company', () => {
      it('should render company defendant details page', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        const res = await request(app).get(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Company details');
      });
    });

    describe('Organisation', () => {
      it('should render defendant details page', async () => {
        app.locals.draftStoreClient = mockCivilClaim;
        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });

      it('should render defendant details page when data is already set in redis', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Respondent();
          claim.respondent1 = {
            type: PartyType.ORGANISATION,
            primaryAddress: {
              PostCode: 'SN1 2RA',
              PostTown: 'Bath',
              AddressLine1: 'Valid address',
              AddressLine2: 'Valid address number',
              AddressLine3: '',
            },
          };
          return claim;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });

      it('should return http 500 status when has error in the get method', async () => {
        mockGetCaseData.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
      });
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant email page if data is successfully updated', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        return claim;
      });
      await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
      });
    });

    it('should show errors if data is not provided', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Respondent();
        return claim;
      });
      await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
      });
    });

    it('should return http 500 status when has error in the get method', async () => {
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
