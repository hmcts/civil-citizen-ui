import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_ORGANISATION_DETAILS_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../../../../main/routes/urls';
import {buildCorrespondenceAddress, buildPrimaryAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {Claim} from '../../../../../../main/common/models/claim';
import {Party} from '../../../../../../main/common/models/party';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  VALID_ADDRESS_LINE_1,
  VALID_CITY,
  VALID_CORRESPONDENCE_ADDRESS_LINE_1,
  VALID_CORRESPONDENCE_CITY,
  VALID_CORRESPONDENCE_POSTCODE,
  VALID_POSTCODE,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/response/citizenDetails/citizenDetailsService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

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
  claim.applicant1.partyName = 'partyName';
  claim.applicant1.contactPerson = 'contactPerson';
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

describe('Claimant Organisation Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.resetAllMocks();
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
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
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  it('should return your company or organisation details page with empty information', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get(CLAIMANT_ORGANISATION_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });
  });

  it('should return your company or organisation details page with information', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicant();
    });
    await request(app)
      .get(CLAIMANT_ORGANISATION_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });
  });

  it('should return your company or organisation details page with information without correspondent address', async () => {
    const buildClaimOfApplicantWithoutCorrespondent = (): Party => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
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
      .get(CLAIMANT_ORGANISATION_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });
  });

  it('should return your company or organisation details page with no primary, correspondence address or claimant details', async () => {
    const buildClaimOfApplicantWithoutInformation = (): Party => {
      claim.applicant1 = new Party();
      claim.applicant1.primaryAddress = undefined;
      return claim.applicant1;
    };
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantWithoutInformation();
    });
    await request(app)
      .get(CLAIMANT_ORGANISATION_DETAILS_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });
  });

  it('get/Claimant organisation details - should return test variable when there is no data on redis and civil-service', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Party();
    });
    await request(app)
      .get('/claim/claimant-organisation-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter organisation details');
      });
  });

  it('POST/Claimant organisation details - should redirect on correct primary address', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Claimant organisation details - should redirect on correct correspondence address', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Claimant Organisation details - should return error on empty primary address line', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send({
        primaryAddressLine1: '',
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
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
      });
  });

  it('POST/Claimant organisation details - should return error on empty primary city', async () => {
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: '',
        primaryPostCode: 'SW1H 9AJ',
        provideCorrespondenceAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CITY);
      });
  });

  it('POST/Claimant Organisation details - should return error on empty primary postcode', async () => {
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: '',
        provideCorrespondenceAddress: 'no',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  it('POST/Claimant Organisation details - should return error on empty correspondence address line', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: '',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        provideCorrespondenceAddress: 'yes',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
      });
  });

  it('POST/Claimant Organisation details - should return error on empty correspondence city', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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
        correspondenceCity: '',
        correspondencePostCode: 'SW1H 9AJ',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
      });
  });

  it('POST/Claimant Organisation details - should return error on empty correspondence postcode', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Claimant Organisation details - should return error on no input', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Claimant Organisation details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CITY);
        expect(res.text).toContain(VALID_POSTCODE);
      });
  });

  it('POST/Claimant Organisation details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_CORRESPONDENCE_ADDRESS_LINE_1);
        expect(res.text).toContain(VALID_CORRESPONDENCE_CITY);
        expect(res.text).toContain(VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('should redirect to claimant DOB screen', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.ORGANISATION);
    });
    await request(app)
      .post(CLAIMANT_ORGANISATION_DETAILS_URL)
      .send(validDataForPost)
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIMANT_PHONE_NUMBER_URL);
      });
  });
});
