import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getDefendantInformation, saveDefendantProperty} from 'services/features/common/defendantDetailsService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {buildAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as caarmTogglesUtils from 'common/utils/carmToggleUtils';
import * as enVars from '../../../../../../main/modules/i18n/locales/en.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/common/defendantDetailsService');

const mockGetRespondentInformation = getDefendantInformation as jest.Mock;
const mockSaveRespondent = saveDefendantProperty as jest.Mock;

const claim = new Claim();

const buildClaimOfRespondent = (): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({});
  claim.respondent1.partyDetails.title = 'title';
  claim.respondent1.partyDetails.firstName = 'firstName';
  claim.respondent1.partyDetails.lastName = 'lastName';
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

const buildClaimOfRespondentTypeWithCcdPhone = (type: PartyType): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({});
  claim.respondent1.type = type;
  claim.respondent1.partyDetails.primaryAddress = buildAddress();
  claim.respondent1.partyDetails.correspondenceAddress = buildAddress();
  claim.respondent1.partyPhone = new PartyPhone();
  claim.respondent1.partyPhone.phone = '123456';
  claim.respondent1.partyPhone.ccdPhoneExist = true;
  return claim.respondent1;
};

const buildClaimOfRespondentTypeWithoutCcdPhone = (type: PartyType): Party => {
  claim.respondent1 = new Party();
  claim.respondent1.partyDetails = new PartyDetails({});
  claim.respondent1.type = type;
  claim.respondent1.partyDetails.primaryAddress = buildAddress();
  claim.respondent1.partyDetails.correspondenceAddress = buildAddress();
  claim.respondent1.partyPhone = new PartyPhone();
  claim.respondent1.partyPhone.phone = '123456';
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

const configureSpy = (service: any, method: string) => jest.spyOn(service, method).mockReset();
const getCaseDataFromStoreSpy = (claim: Claim) => jest.spyOn(draftStoreService, 'getCaseDataFromStore')
  .mockReturnValue(Promise.resolve(claim));
const carmToggleSpy = (calmEnabled: boolean) => configureSpy(caarmTogglesUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

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
    const mockClaim = { submittedDate: new Date(2024, 5, 23) } as Claim;
    getCaseDataFromStoreSpy(mockClaim);
    carmToggleSpy(true);
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
      claim.respondent1.partyDetails.title = 'title';
      claim.respondent1.partyDetails.firstName = 'firstName';
      claim.respondent1.partyDetails.lastName = 'lastName';
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

  it('should return mandatory contact person label and error on empty contact person - company', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.COMPANY);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        contactPerson: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_CONTACT_PERSON);
        expect(res.text).toContain(enVars.COMMON.MANDATORY_CONTACT_PERSON);
        expect(res.text).not.toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
      });
  });

  it('should return optional contact person label when carm toggle disabled - company', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.COMPANY);
    });
    carmToggleSpy(false);
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        contactPerson: 'Joe Bloggs',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
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

  it('should return mandatory contact person label and error on empty contact person - organisation', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        contactPerson: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_CONTACT_PERSON);
        expect(res.text).toContain(enVars.COMMON.MANDATORY_CONTACT_PERSON);
        expect(res.text).not.toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
      });
  });

  it('should return optional contact person label when carm toggle disabled - organisation', async () => {
    mockGetRespondentInformation.mockImplementation(async () => {
      return buildClaimOfRespondentType(PartyType.ORGANISATION);
    });
    carmToggleSpy(false);
    await request(app)
      .post(CITIZEN_DETAILS_URL)
      .send({
        contactPerson: 'Joe Bloggs',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
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
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    it('should redirect to task-list screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentTypeWithCcdPhone(PartyType.COMPANY)};
      });
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = buildClaimOfRespondentTypeWithCcdPhone(PartyType.COMPANY);
        return claim;
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to task-list screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentTypeWithCcdPhone(PartyType.ORGANISATION)};
      });
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = buildClaimOfRespondentTypeWithCcdPhone(PartyType.ORGANISATION);
        return claim;
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
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
        return {...buildClaimOfRespondentTypeWithCcdPhone(PartyType.SOLE_TRADER)};
      });
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = buildClaimOfRespondentTypeWithCcdPhone(PartyType.SOLE_TRADER);
        return claim;
      });
      await request(app)
        .post(CITIZEN_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should redirect to phone screen if respondent type is SOLE TRADER with phone is not provided', async () => {
      mockGetRespondentInformation.mockImplementation(async () => {
        return {...buildClaimOfRespondentTypeWithoutCcdPhone(PartyType.SOLE_TRADER)};
      });
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = buildClaimOfRespondentTypeWithoutCcdPhone(PartyType.SOLE_TRADER);
        return claim;
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
});
