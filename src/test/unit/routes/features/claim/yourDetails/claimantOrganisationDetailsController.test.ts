import {app} from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_PHONE_NUMBER_URL,
} from 'routes/urls';
import {buildAddress} from '../../../../../utils/mockClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {PartyDetails} from 'form/models/partyDetails';
import * as caarmTogglesUtils from 'common/utils/carmToggleUtils';
import * as enVars from '../../../../../../main/modules/i18n/locales/en.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const claim = new Claim();

const buildClaimOfApplicantWithType = (type: PartyType): Claim => {
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.partyDetails.individualTitle = 'individualTitle';
  claim.applicant1.partyDetails.individualFirstName = 'individualFirstName';
  claim.applicant1.partyDetails.individualLastName = 'individualLastName';
  claim.applicant1.partyDetails.primaryAddress = buildAddress();
  claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
  claim.applicant1.partyDetails.partyName = 'partyName';
  claim.applicant1.partyDetails.contactPerson = 'contactPerson';
  claim.applicant1.type = type;
  return claim;
};

const buildClaimOfApplicantType = (type: PartyType): Claim => {
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.type = type;
  claim.applicant1.partyDetails.primaryAddress = buildAddress();
  claim.applicant1.partyDetails.correspondenceAddress = buildAddress();
  claim.applicant1.partyDetails.partyName = 'partyName';
  claim.applicant1.partyDetails.contactPerson = 'contactPerson';
  return claim;
};

const nock = require('nock');

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['',''],
  addressLine3: ['',''],
  city: ['London','London'],
  postCode: ['SW1H 9AJ','SW1H 9AJ'],
  partyName: 'partyName',
  contactPerson: 'contactPerson',
};

const configureSpy = (service: any, method: string) => jest.spyOn(service, method).mockReset();
const getCaseDataFromStoreSpy = (claim: Claim) => jest.spyOn(draftStoreService, 'getCaseDataFromStore')
  .mockReturnValue(Promise.resolve(claim));
const carmToggleSpy = (calmEnabled: boolean) => configureSpy(caarmTogglesUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

describe('Claimant Organisation Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.resetAllMocks();
    const mockClaim = { submittedDate: new Date(2024, 5, 23) } as Claim;
    getCaseDataFromStoreSpy(mockClaim);
    carmToggleSpy(true);
  });

  describe('Organisation Type', () => {
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
        const claim = new Claim();
        claim.applicant1 = {type: PartyType.ORGANISATION};
        return claim;
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
        return buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      });
      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter organisation details');
        });
    });

    it('should return mandatory contact person label and error on empty contact person', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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

    it('should return optional contact person label when carm toggle disabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      });
      carmToggleSpy(false);
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return your company or organisation details page with information without correspondent address', async () => {
      const buildClaimOfApplicantWithoutCorrespondent = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.type = PartyType.ORGANISATION;
        claim.applicant1.partyDetails.individualTitle = 'individualTitle';
        claim.applicant1.partyDetails.individualFirstName = 'individualFirstName';
        claim.applicant1.partyDetails.individualLastName = 'individualLastName';
        claim.applicant1.partyDetails.primaryAddress = buildAddress();
        return claim;
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
      const buildClaimOfApplicantWithoutInformation = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.partyDetails.primaryAddress = undefined;
        claim.applicant1.type = PartyType.ORGANISATION;
        return claim;
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
        const claim = new Claim();
        claim.applicant1 = {type: PartyType.ORGANISATION};
        return claim;
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
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant organisation details - should return error on empty primary city', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['',''],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty primary postcode', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['',''],
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence address line', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London','London'],
          postCode: ['SW1H 9AJ','SW1H 9AJ'],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence city', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['SW1H 9AJ','SW1H 9AJ'],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence postcode', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London','London'],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on no input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['',''],
          postCode: ['',''],
          provideCorrespondenceAddress: 'yes',
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

    it('POST/Claimant Organisation details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['',''],
          postCode: ['',''],
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.ORGANISATION);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('should redirect to claimant phone number screen', async () => {
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

  describe('Company Type', () => {
    describe('on Exception', () => {
      it('should return http 500 when has error in the get method', async () => {
        mockGetCaseData.mockImplementation(async () => {
          throw new Error(TestMessages.REDIS_FAILURE);
        });
        await request(app)
          .get(CLAIMANT_COMPANY_DETAILS_URL)
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
          .post(CLAIMANT_COMPANY_DETAILS_URL)
          .send(validDataForPost)
          .expect((res) => {
            expect(res.status).toBe(500);
            expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
          });
      });
    });

    it('should return your company details page with empty information', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = {type: PartyType.COMPANY};
        return claim;
      });
      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('should return your company details page with information', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.COMPANY);
      });
      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('should return mandatory contact person label and error on empty contact person', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
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

    it('should return optional contact person label when carm toggle disabled', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithType(PartyType.COMPANY);
      });
      carmToggleSpy(false);
      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return your company details page with information without correspondent address', async () => {
      const buildClaimOfApplicantWithoutCorrespondent = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.type = PartyType.COMPANY;
        claim.applicant1.partyDetails.individualTitle = 'individualTitle';
        claim.applicant1.partyDetails.individualFirstName = 'individualFirstName';
        claim.applicant1.partyDetails.individualLastName = 'individualLastName';
        claim.applicant1.partyDetails.primaryAddress = buildAddress();
        return claim;
      };
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithoutCorrespondent();
      });
      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('should return your company details page with no primary, correspondence address or claimant details', async () => {
      const buildClaimOfApplicantWithoutInformation = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.type = PartyType.COMPANY;
        claim.applicant1.partyDetails.primaryAddress = undefined;
        return claim;
      };
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantWithoutInformation();
      });
      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('POST/Claimant company details - should redirect on correct primary address', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant company details - should redirect on correct correspondence address', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant company details - should return error on empty primary address line', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London','London'],
          postCode: ['SW1H 9AJ','SW1H 9AJ'],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant company details - should return error on empty primary city', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: 'Flat 3A Middle Road',
          addressLine2: '',
          addressLine3: '',
          city: '',
          postCode: 'SW1H 9AJ',
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
        });
    });

    it('POST/Claimant company details - should return error on empty primary postcode', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: 'Flat 3A Middle Road',
          addressLine2: '',
          addressLine3: '',
          city: 'London',
          postCode: '',
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant company details - should return error on empty correspondence address line', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London','London'],
          postCode: ['SW1H 9AJ','SW1H 9AJ'],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant Company details - should return error on empty correspondence city', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['SW1H 9AJ','SW1H 9AJ'],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        });
    });

    it('POST/Claimant Company details - should return error on empty correspondence postcode', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road','Flat 3A Middle Road'],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London','London'],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on no input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['',''],
          postCode: ['',''],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['',''],
          postCode: ['',''],
          provideCorrespondenceAddress: 'no',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send({
          addressLine1: ['Flat 3A Middle Road',''],
          addressLine2: ['',''],
          addressLine3: ['',''],
          city: ['London',''],
          postCode: ['SW1H 9AJ',''],
          provideCorrespondenceAddress: 'yes',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('should redirect to claimant phone number screen', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return buildClaimOfApplicantType(PartyType.COMPANY);
      });
      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_PHONE_NUMBER_URL);
        });
    });
  });
});
