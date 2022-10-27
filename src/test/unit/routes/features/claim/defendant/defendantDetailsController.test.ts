import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../../../../main/routes/urls';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Claim} from '../../../../../../main/common/models/claim';
import {Party} from '../../../../../../main/common/models/party';
import {PartyType} from '../../../../../../main/common/models/partyType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const mockSaveData = {
  individualTitle: 'Mr',
  individualFirstName: 'John',
  individualLastName: 'Doe',
  businessName: 'John`s Sons Ltd',
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
    describe('Individual', () => {
      it('should render individual details page', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = {type: PartyType.INDIVIDUAL};
          return claim;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant’s details');
      });
    });

    describe('Company', () => {
      it('should render company defendant details page', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = {type: PartyType.COMPANY};
          return claim;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Company details');
      });
    });

    describe('Organisation', () => {
      it('should render defendant details page', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = {type: PartyType.ORGANISATION};
          return claim;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });

      it('should render defendant details page when data is already set in redis', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
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
        mockGetCaseData.mockImplementationOnce(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    describe('Sole Trader', () => {
      it('should render defendant details page', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = {type: PartyType.SOLE_TRADER};
          return claim;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant&#39;s details');
      });

      it('should render defendant details page when data is already set in redis', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
          claim.respondent1 = {
            type: PartyType.SOLE_TRADER,
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
        const res = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant&#39;s details');
      });

      it('should return http 500 status when has error in the get method', async () => {
        mockGetCaseData.mockImplementationOnce(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
      });
    });
  });

  describe('on POST', () => {
    describe('Individual', () => {
      it('should redirect to the defendant email page if data is successfully saved', async () => {
        const _mockSaveData = mockSaveData;
        _mockSaveData.businessName = '';
        _mockSaveData.individualFirstName = 'Jane';
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
          return claim;
        });
        const res = await request(app).post(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL).send(_mockSaveData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
      });

      it('should show errors if required fields are not filled in', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
          claim.respondent1.type = PartyType.INDIVIDUAL;
          return claim;
        });
        await request(app)
          .post(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL)
          .send({individualFirstName: '', individualLastName: ''}).expect((res) => {
            expect(res.status).toBe(200);
            expect(res.text).toContain(TestMessages.ENTER_FIRST_NAME);
            expect(res.text).toContain(TestMessages.ENTER_LAST_NAME);
          });
      });
    });

    it('should redirect to the defendant email page if data is successfully updated', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        claim.respondent1.type = PartyType.ORGANISATION;
        return claim;
      });
      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
    });

    it('should show errors if data is not provided', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = new Party();
        return claim;
      });
      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
      expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      expect(res.text).toContain(TestMessages.ENTER_TOWN);
    });

    it('should return http 500 status when has error in the get method', async () => {
      mockSaveDraftClaim.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    describe('Sole Trader', () => {
      it('should redirect to the defendant email page if data is successfully updated', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
          return claim;
        });
        const res = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).send(mockSaveData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
      });

      it('should show errors if data is not provided', async () => {
        mockGetCaseData.mockImplementation(async () => {
          const claim = new Claim();
          claim.respondent1 = new Party();
          return claim;
        });
        const res = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).send({individualFirstName: '', individualLastName: ''});
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_NAME);
        expect(res.text).toContain(TestMessages.ENTER_LAST_NAME);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
      });

      it('should return http 500 status when has error in the get method', async () => {
        mockGetCaseData.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        const res = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
