import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CLAIM_TASK_LIST_URL,
  DOB_URL,
} from 'routes/urls';
import {getDefendantInformation, saveDefendantProperty} from 'services/features/common/defendantDetailsService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {buildAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/common/defendantDetailsService');

const mockGetRespondentInformation = getDefendantInformation as jest.Mock;
const mockSaveRespondent = saveDefendantProperty as jest.Mock;

const claim = new Claim();

const buildClaimOfRespondent = (): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({});
  claim.respondent1.partyDetails.individualTitle = 'individualTitle';
  claim.respondent1.partyDetails.individualFirstName = 'individualFirstName';
  claim.respondent1.partyDetails.individualLastName = 'individualLastName';
  claim.respondent1.partyDetails.primaryAddress = buildAddress();
  claim.respondent1.partyDetails.correspondenceAddress = buildAddress();
  return claim.respondent1;
};

const buildClaimOfRespondentType = (type: PartyType): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({});
  claim.respondent1.type = type;
  claim.respondent1.partyDetails.primaryAddress = buildAddress();
  claim.respondent1.partyDetails.correspondenceAddress = buildAddress();
  return claim.respondent1;
};

const nock = require('nock');

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['', ''],
  addressLine3: ['', ''],
  city: ['London', 'London'],
  postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
  postToThisAddress: 'no',
};

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return http 500 when has error in the post method', async () => {
    mockSaveRespondent.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should return your details page with empty information', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details page with information', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details page with information without correspondent address', async () => {
    const buildClaimOfRespondentWithoutCorrespondent = (): Party => {
      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = new PartyDetails({});
      claim.respondent1.partyDetails.individualTitle = 'individualTitle';
      claim.respondent1.partyDetails.individualFirstName = 'individualFirstName';
      claim.respondent1.partyDetails.individualLastName = 'individualLastName';
      claim.respondent1.partyDetails.primaryAddress = buildAddress();
      return claim.respondent1;
    };
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentWithoutCorrespondent();
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  it('should return your details company page', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.COMPANY);
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Company name');
      });
  });

  it('should return your details organisation page', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .get(CITIZEN_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('Organisation name');
      });
  });

  it('POST/Citizen details - should redirect on correct primary address', async () => {
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', ''],
        postToThisAddress: 'no',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Citizen details - should return error on empty primary address line', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', ''],
        postToThisAddress: 'no',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
      });
  });

  it('POST/Citizen details - should return error on empty primary city', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['SW1H 9AJ', ''],
        postToThisAddress: 'no',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
      });
  });

  it('POST/Citizen details - should return error on empty primary postcode', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['', ''],
        postToThisAddress: 'no',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      });
  });

  it('POST/Citizen details - should return error on input for primary address when postToThisAddress is set to NO', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['', ''],
        postToThisAddress: 'no',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      });
  });

  it('get/Citizen details - should return test variable when there is no data on redis and civil-service', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      const party = new Party();
      party.type = PartyType.INDIVIDUAL;
      return party;
    });
    await request(app)
      .get('/case/1111/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
        expect(res.text).toContain('individualTitle Test');
      });
  });

  describe('Redirect to Phone or DOB screen (phone number not provided)', () => {
    it('should redirect to confirm phone screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.COMPANY);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
    it('should redirect to confirm phone screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.INDIVIDUAL);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DOB_URL);
        });
    });
    it('should redirect to confirm your phone screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return buildClaimOfRespondentType(PartyType.SOLE_TRADER);
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
        });
    });
  });

  describe('Redirect to Phone or DOB screen (phone number provided)', () => {
    it('should redirect to task-list screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.COMPANY), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    it('should redirect to task-list screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.ORGANISATION), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.INDIVIDUAL), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DOB_URL);
        });
    });
    it('should redirect to task-list  screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentType(PartyType.SOLE_TRADER), partyPhone: '123456'};
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
  });
});
