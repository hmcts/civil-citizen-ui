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
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../../main/common/models/party';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {
  getDefendantInformation,
  saveDefendantParty,
} from '../../../../../../main/services/features/claim/yourDetails/defendantDetailsService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/yourDetails/defendantDetailsService');

const mockDefendantInformation = getDefendantInformation as jest.Mock;
const mockSaveDefendant = saveDefendantParty as jest.Mock;

const mockSaveData = {
  individualTitle: 'Mr',
  individualFirstName: 'John',
  individualLastName: 'Doe',
  businessName: 'John`s Sons Ltd',
  partyName: 'Bob Ltd',
  contactPerson: 'Louise',
  primaryAddressLine1: 'Fake Org',
  primaryAddressLine2: 'Somewhere Defined',
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
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.INDIVIDUAL;
          return party;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant');
      });
    });

    describe('Company', () => {
      it('should render company defendant details page', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.COMPANY;
          return party;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Company details');
      });
    });

    describe('Organisation', () => {
      it('should render defendant details page when data is already set in redis', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.ORGANISATION;
          party.primaryAddress = {
            PostCode: 'SN1 2RA',
            PostTown: 'Bath',
            AddressLine1: 'Valid address',
            AddressLine2: 'Valid address number',
            AddressLine3: '',
          };
          return party;
        });

        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });

      it('should return http 500 status when has error in the get method', async () => {
        mockDefendantInformation.mockImplementationOnce(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

    describe('Sole Trader', () => {
      it('should render defendant details page', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.SOLE_TRADER;
          return party;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant');
      });

      it('should render defendant details page when data is already set in redis', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.SOLE_TRADER;
          party.primaryAddress = {
            PostCode: 'SN1 2RA',
            PostTown: 'Bath',
            AddressLine1: 'Valid address',
            AddressLine2: 'Valid address number',
            AddressLine3: '',
          };
          return party;
        });
        const res = await request(app).get(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter the defendant&#39;s details');
      });

      it('should return http 500 status when has error in the get method', async () => {
        mockDefendantInformation.mockImplementationOnce(async () => {
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
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.INDIVIDUAL;
          return party;
        });
        mockSaveDefendant.mockImplementation(async () => Promise<void>);
        const res = await request(app).post(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL).send(_mockSaveData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
      });

      it('should show errors if required fields are not filled in', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.INDIVIDUAL;
          return party;
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
      mockDefendantInformation.mockImplementation(async () => {
        const party = new Party();
        party.type = PartyType.ORGANISATION;
        return party;
      });
      mockSaveDefendant.mockImplementation(async () => Promise<void>);

      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
    });

    it('should show errors if data is not provided', async () => {
      mockDefendantInformation.mockImplementation(async () => {
        const party = new Party();
        party.type = PartyType.ORGANISATION;
        return party;
      });

      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
      expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      expect(res.text).toContain(TestMessages.ENTER_TOWN);
    });

    it('should return http 500 status when has error in the get method', async () => {
      mockSaveDefendant.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      const res = await request(app).post(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL).send(mockSaveData);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    describe('Sole Trader', () => {
      it('should redirect to the defendant email page if data is successfully updated', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.SOLE_TRADER;
          return party;
        });
        mockSaveDefendant.mockImplementation(async () => Promise<void>);

        const res = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).send(mockSaveData);
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_DEFENDANT_EMAIL_URL);
      });

      it('should show errors if data is not provided', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          const party = new Party();
          party.type = PartyType.SOLE_TRADER;
          return party;
        });

        const res = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL).send({
          individualFirstName: '',
          individualLastName: '',
        });
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_NAME);
        expect(res.text).toContain(TestMessages.ENTER_LAST_NAME);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
      });

      it('should return http 500 status when has error in the post method', async () => {
        mockDefendantInformation.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        const res = await request(app).post(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
