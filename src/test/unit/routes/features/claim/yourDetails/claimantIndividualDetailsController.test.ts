import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {CLAIMANT_DOB_URL, CLAIMANT_INDIVIDUAL_DETAILS_URL} from 'routes/urls';
import {buildAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {PartyDetails} from 'form/models/partyDetails';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

const buildClaimOfApplicant = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.partyDetails.title = 'title';
  claim.applicant1.partyDetails.firstName = 'firstName';
  claim.applicant1.partyDetails.lastName = 'lastName';
  claim.applicant1.partyDetails.primaryAddress = buildAddress();
  claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
  claim.applicant1.partyDetails.partyName = 'partyName';
  claim.applicant1.partyDetails.contactPerson = 'contactPerson';
  return claim;
};

const buildClaimOfApplicantType = (type: PartyType): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.type = type;
  claim.applicant1.partyDetails.primaryAddress = buildAddress();
  claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
  return claim;
};

const nock = require('nock');

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
  addressLine2: ['',''],
  addressLine3: ['',''],
  city: ['London','London'],
  postCode: ['SW1H 9AJ','SW1H 9AJ'],
  provideCorrespondenceAddress: 'no',
  partyName: 'partyName',
  contactPerson: 'contactPerson',
};

const configureSpy = (service: any, method: string) => jest.spyOn(service, method).mockReset();
const getCaseDataFromStoreSpy = (claim: Claim) => jest.spyOn(draftStoreService, 'getCaseDataFromStore')
  .mockReturnValue(Promise.resolve(claim));
const carmToggleSpy = (calmEnabled: boolean) => configureSpy(launchDarklyClient, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

describe('Claimant Individual Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

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
      return new Claim();
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
    const buildClaimOfApplicantWithoutCorrespondent = (): Claim => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = new PartyDetails({});
      claim.applicant1.type = PartyType.INDIVIDUAL;
      claim.applicant1.partyDetails.title = 'title';
      claim.applicant1.partyDetails.firstName = 'firstName';
      claim.applicant1.partyDetails.lastName = 'lastName';
      claim.applicant1.partyDetails.primaryAddress = buildAddress();
      return claim;
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
    const buildClaimOfApplicantWithoutInformation = (): Claim => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = new PartyDetails({});
      claim.applicant1.partyDetails.primaryAddress = undefined;
      return claim;
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
      return new Claim();
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
        addressLine1: ['Flat 3A Middle Road',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London',''],
        postCode: ['SW1H 9AJ',''],
        provideCorrespondenceAddress: 'no',
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
        addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London','London'],
        postCode: ['SW1H 9AJ','SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });

  it('POST/Claimant Individual details - should return error on empty primary address line', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London',''],
        postCode: ['SW1H 9AJ',''],
        provideCorrespondenceAddress: 'no',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
      });
  });

  it('POST/Claimant individual details - should return error on empty primary city', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['',''],
        postCode: ['SW1H 9AJ',''],
        provideCorrespondenceAddress: 'no',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
      });
  });

  it('POST/Claimant Individual details - should return error on empty primary postcode', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London',''],
        postCode: ['',''],
        provideCorrespondenceAddress: 'no',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      });
  });

  it('POST/Claimant Individual details - should return error on empty correspondence address line', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London','London'],
        postCode: ['SW1H 9AJ','SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
      });
  });

  it('POST/Claimant Individual details - should return error on empty correspondence city', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London',''],
        postCode: ['SW1H 9AJ','SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
      });
  });

  it('POST/Claimant Individual details - should return error on empty correspondence postcode', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London','London'],
        postCode: ['SW1H 9AJ',''],
        provideCorrespondenceAddress: 'yes',
        partyName: 'partyName',
        contactPerson: 'contactPerson',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
      });
  });

  it('POST/Claimant Individual details - should return error on no input', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['',''],
        postCode: ['',''],
        provideCorrespondenceAddress: 'yes',
        partyName: 'partyName',
        contactPerson: 'contactPerson',

      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        expect(res.text).toContain(TestMessages.ENTER_TOWN);
        expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
      });
  });

  it('POST/Claimant individual details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
    mockGetCaseData.mockImplementation(async () => {
      return buildClaimOfApplicantType(PartyType.INDIVIDUAL);
    });
    await request(app)
      .post(CLAIMANT_INDIVIDUAL_DETAILS_URL)
      .send({
        addressLine1: ['',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['',''],
        postCode: ['',''],
        provideCorrespondenceAddress: 'no',
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
        addressLine1: ['Flat 3A Middle Road',''],
        addressLine2: ['',''],
        addressLine3: ['',''],
        city: ['London',''],
        postCode: ['SW1H 9AJ',''],
        provideCorrespondenceAddress: 'yes',
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
