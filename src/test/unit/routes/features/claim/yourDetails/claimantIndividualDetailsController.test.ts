import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_DOB_URL, CLAIMANT_INDIVIDUAL_DETAILS_URL} from 'routes/urls';
import {buildCorrespondenceAddress, buildPrimaryAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/response/citizenDetails/citizenDetailsService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

const claim = new Claim();

const buildClaimOfApplicant = (): Party => {
  claim.applicant1 = new Party();
  claim.applicant1.individualTitle = 'individualTitle';
  claim.applicant1.individualFirstName = 'individualFirstName';
  claim.applicant1.individualLastName = 'individualLastName';
  claim.applicant1.primaryAddress = buildPrimaryAddress();
  claim.applicant1.correspondenceAddress = buildCorrespondenceAddress();
  claim.applicant1.partyName = 'partyName';
  claim.applicant1.contactPerson = 'contactPerson';
  return claim.applicant1;
};

const buildClaimOfApplicantType = (type: PartyType): Party => {
  claim.applicant1 = new Party();
  claim.applicant1.type = type;
  claim.applicant1.primaryAddress = buildPrimaryAddress();
  claim.applicant1.correspondenceAddress = buildCorrespondenceAddress();
  return claim.applicant1;
};

const nock = require('nock');

const validDataForPost = {
  primaryAddressLine1: 'Flat 3A Middle Road',
  primaryAddressLine2: '',
  primaryAddressLine3: '',
  primaryCity: 'London',
  primaryPostCode: 'SW1H 9AJ',
  provideCorrespondenceAddress: 'no',
  correspondenceAddressLine1: '',
  correspondenceAddressLine2: '',
  correspondenceAddressLine3: '',
  correspondenceCity: '',
  correspondencePostCode: '',
  partyName: 'partyName',
  contactPerson: 'contactPerson',
};

describe('Claimant Individual Details page', () => {
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
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIMANT_INDIVIDUAL_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return your details page with empty information', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter your details');
      });
  });

  it('should return your details page with information', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicant();
    });
    await request(app)
      .get(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter your details');
      });
  });

  it('should return your details page with information without correspondent address', async () => {
    const buildClaimOfApplicantWithoutCorrespondent = (): Party => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.INDIVIDUAL;
      claim.applicant1.individualTitle = 'individualTitle';
      claim.applicant1.individualFirstName = 'individualFirstName';
      claim.applicant1.individualLastName = 'individualLastName';
      claim.applicant1.primaryAddress = buildPrimaryAddress();
      return claim.applicant1;
    };
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantWithoutCorrespondent();
    });
    await request(app)
      .get(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter your details');
      });
  });

  it('should return your details page with no primary, correspondence address or claimant details', async () => {
    const buildClaimOfApplicantWithoutInformation = (): Party => {
      claim.applicant1 = new Party();
      claim.applicant1.primaryAddress = undefined;
      return claim.applicant1;
    };
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantWithoutInformation();
    });
    await request(app)
      .get(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter your details');
      });
  });

  it('get/Claimant individual details - should return test variable when there is no data on redis and civil-service', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get('/claim/claimant-individual-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter your details');
      });
  });

  it('POST/Claimant Individual details - should redirect on correct primary address', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        provideCorrespondenceAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Claimant Individual details - should redirect on correct correspondence address', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        provideCorrespondenceAddress: 'yes',
        correspondenceAddressLine1: 'Flat 3A Middle Road',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: 'London',
        correspondencePostCode: 'SW1H 9AJ',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Claimant Individual details - should return error on no input', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        provideCorrespondenceAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
        partyName: 'partyName',
        contactPerson: 'contactPerson',

      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Claimant individual details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        provideCorrespondenceAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      });
  });

  it('POST/Claimant Individual details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: '',
        provideCorrespondenceAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('should redirect to claimant DOB screen', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIMANT_DOB_URL);
      });
  });
});
