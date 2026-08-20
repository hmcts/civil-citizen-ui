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
import {PartyDetails} from 'form/models/partyDetails';
import * as enVars from '../../../../../../main/modules/i18n/locales/en.json';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import * as ordnanceSurveyService from '../../../../../../main/modules/ordance-survey-key/ordanceSurveyKeyService';

const nock = require('nock');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/ordance-survey-key/ordanceSurveyKeyService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockLookupByPostcode = ordnanceSurveyService.lookupByPostcodeAndDataSet as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

const claim = new Claim();

const buildClaimOfApplicantWithType = (type: PartyType): Claim => {
  claim.applicant1 = new Party();
  claim.applicant1.partyDetails = new PartyDetails({});
  claim.applicant1.partyDetails.title = 'title';
  claim.applicant1.partyDetails.firstName = 'firstName';
  claim.applicant1.partyDetails.lastName = 'lastName';
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

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['',''],
  addressLine3: ['',''],
  city: ['London','London'],
  postCode: ['SW1H 9AJ','SW1H 9AJ'],
  partyName: 'partyName',
  contactPerson: 'contactPerson',
};

const carmToggleSpy = (carmEnabled: boolean) =>
  jest.spyOn(launchDarklyClient, 'isCarmEnabledForCase').mockResolvedValue(carmEnabled);

describe('Claimant Organisation Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.clearAllMocks();
    mockLookupByPostcode.mockResolvedValue({
      valid: true,
      addresses: [{ country: 'England' }],
    });

    carmToggleSpy(true);
  });

  describe('Organisation Type', () => {
    describe('on Exception', () => {
      it('should return http 500 when has error in the get method', async () => {
        mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
  
        await request(app)
          .get(CLAIMANT_ORGANISATION_DETAILS_URL)
          .expect((res: request.Response) => {
            expect(res.status).toBe(500);
            expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
          });
      });

      it('should return http 500 when has error in the post method', async () => {
        mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
          mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
  
        await request(app)
          .post(CLAIMANT_ORGANISATION_DETAILS_URL)
          .send(validDataForPost)
          .expect((res: request.Response) => {
            expect(res.status).toBe(500);
            expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
          });
      });
    });

    it('should return your company or organisation details page with empty information', async () => {
      const mockClaim = new Claim();
      mockClaim.applicant1 = {type: PartyType.ORGANISATION} as Party;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter organisation details');
        });
    });

    it('should return your company or organisation details page with information', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter organisation details');
        });
    });

    it('should return mandatory contact person label and error on empty contact person', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_CONTACT_PERSON);
          expect(res.text).toContain(enVars.COMMON.MANDATORY_CONTACT_PERSON);
          expect(res.text).not.toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return optional contact person label when carm toggle disabled', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      carmToggleSpy(false);

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return your company or organisation details page with information without correspondent address', async () => {
      const buildClaimOfApplicantWithoutCorrespondent = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.type = PartyType.ORGANISATION;
        claim.applicant1.partyDetails.title = 'title';
        claim.applicant1.partyDetails.firstName = 'firstName';
        claim.applicant1.partyDetails.lastName = 'lastName';
        claim.applicant1.partyDetails.primaryAddress = buildAddress();
        return claim;
      };

      const mockClaim = buildClaimOfApplicantWithoutCorrespondent();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
        .expect((res: request.Response) => {
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

      const mockClaim = buildClaimOfApplicantWithoutInformation();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_ORGANISATION_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter organisation details');
        });
    });

    it('get/Claimant organisation details - should return test variable when there is no data on redis and civil-service', async () => {
      const mockClaim = new Claim();
      mockClaim.applicant1 = {type: PartyType.ORGANISATION} as Party;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get('/claim/claimant-organisation-details')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter organisation details');
        });
    });

    it('POST/Claimant organisation details - should redirect on correct primary address', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant organisation details - should redirect on correct correspondence address', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty primary address line', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant organisation details - should return error on empty primary city', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty primary postcode', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence address line', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence city', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        });
    });

    it('POST/Claimant Organisation details - should return error on empty correspondence postcode', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on no input', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Organisation details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('should redirect to claimant phone number screen', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.ORGANISATION);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_PHONE_NUMBER_URL);
        });
    });
  });

  describe('Company Type', () => {
    describe('on Exception', () => {
      it('should return http 500 when has error in the get method', async () => {
        mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
  
        await request(app)
          .get(CLAIMANT_COMPANY_DETAILS_URL)
          .expect((res: request.Response) => {
            expect(res.status).toBe(500);
            expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
          });
      });

      it('should return http 500 when has error in the post method', async () => {
        mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
          mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
  
        await request(app)
          .post(CLAIMANT_COMPANY_DETAILS_URL)
          .send(validDataForPost)
          .expect((res: request.Response) => {
            expect(res.status).toBe(500);
            expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
          });
      });
    });

    it('should return your company details page with empty information', async () => {
      const mockClaim = new Claim();
      mockClaim.applicant1 = {type: PartyType.COMPANY} as Party;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('should return your company details page with information', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('should return mandatory contact person label and error on empty contact person', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_CONTACT_PERSON);
          expect(res.text).toContain(enVars.COMMON.MANDATORY_CONTACT_PERSON);
          expect(res.text).not.toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return optional contact person label when carm toggle disabled', async () => {
      const mockClaim = buildClaimOfApplicantWithType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      carmToggleSpy(false);

      await request(app)
        .post(CLAIMANT_ORGANISATION_DETAILS_URL)
        .send({
          contactPerson: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(enVars.COMMON.OPTIONAL_CONTACT_PERSON);
        });
    });

    it('should return your company details page with information without correspondent address', async () => {
      const buildClaimOfApplicantWithoutCorrespondent = (): Claim => {
        claim.applicant1 = new Party();
        claim.applicant1.partyDetails = new PartyDetails({});
        claim.applicant1.type = PartyType.COMPANY;
        claim.applicant1.partyDetails.title = 'title';
        claim.applicant1.partyDetails.firstName = 'firstName';
        claim.applicant1.partyDetails.lastName = 'lastName';
        claim.applicant1.partyDetails.primaryAddress = buildAddress();
        return claim;
      };

      const mockClaim = buildClaimOfApplicantWithoutCorrespondent();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res: request.Response) => {
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

      const mockClaim = buildClaimOfApplicantWithoutInformation();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .get(CLAIMANT_COMPANY_DETAILS_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter company details');
        });
    });

    it('POST/Claimant company details - should redirect on correct primary address', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant company details - should redirect on correct correspondence address', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('POST/Claimant company details - should return error on empty primary address line', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant company details - should return error on empty primary city', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
        });
    });

    it('POST/Claimant company details - should return error on empty primary postcode', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant company details - should return error on empty correspondence address line', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
        });
    });

    it('POST/Claimant Company details - should return error on empty correspondence city', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
        });
    });

    it('POST/Claimant Company details - should return error on empty correspondence postcode', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on no input', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on input for primary address when provideCorrespondenceAddress is set to NO', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_FIRST_ADDRESS);
          expect(res.text).toContain(TestMessages.ENTER_TOWN);
          expect(res.text).toContain(TestMessages.ENTER_POSTCODE);
        });
    });

    it('POST/Claimant Company details - should return error on input for correspondence address when provideCorrespondenceAddress is set to YES', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

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
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_ADDRESS_LINE_1);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_CITY);
          expect(res.text).toContain(TestMessages.VALID_CORRESPONDENCE_POSTCODE);
        });
    });

    it('should redirect to claimant phone number screen', async () => {
      const mockClaim = buildClaimOfApplicantType(PartyType.COMPANY);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      await request(app)
        .post(CLAIMANT_COMPANY_DETAILS_URL)
        .send(validDataForPost)
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_PHONE_NUMBER_URL);
        });
    });
  });
});
