import {Response} from 'express';
import claimantDetailsController from '../../../../../../main/routes/features/claim/yourDetails/claimantDetailsController';
import {CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {buildAddress} from '../../../../../utils/mockClaim';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/claimantDetailsService', () => ({
  getClaimantInformation: jest.fn(),
  saveClaimantProperty: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/ordance-survey-key/ordanceSurveyKeyService', () => ({
  lookupByPostcodeAndDataSet: jest.fn(),
}));

const mockGetClaimantInformation = getClaimantInformation as jest.Mock;
const mockSaveClaimantProperty = saveClaimantProperty as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockLookupByPostcode = lookupByPostcodeAndDataSet as jest.Mock;

const buildApplicantWithType = (type: PartyType): Party => {
  const applicant = new Party();
  applicant.partyDetails = new PartyDetails({});
  applicant.partyDetails.title = 'title';
  applicant.partyDetails.firstName = 'firstName';
  applicant.partyDetails.lastName = 'lastName';
  applicant.partyDetails.primaryAddress = buildAddress();
  applicant.partyDetails.correspondenceAddress = buildAddress();
  applicant.partyDetails.partyName = 'partyName';
  applicant.partyDetails.contactPerson = 'contactPerson';
  applicant.type = type;
  return applicant;
};

const buildApplicantType = (type: PartyType): Party => {
  const applicant = new Party();
  applicant.partyDetails = new PartyDetails({});
  applicant.type = type;
  applicant.partyDetails.primaryAddress = buildAddress();
  applicant.partyDetails.correspondenceAddress = buildAddress();
  applicant.partyDetails.partyName = 'partyName';
  applicant.partyDetails.contactPerson = 'contactPerson';
  return applicant;
};

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['', ''],
  addressLine3: ['', ''],
  city: ['London', 'London'],
  postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
  partyName: 'partyName',
  contactPerson: 'contactPerson',
};

describe('Claimant Organisation Details page', () => {
  const getHandler = getRouteHandler(claimantDetailsController, 'get');
  const postHandler = getRouteHandler(claimantDetailsController, 'post');
  const viewPath = 'features/claim/yourDetails/claimant-organisation-details';
  const pageTitle = 'PAGES.COMPANY_DETAILS.CLAIMANT_PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockLookupByPostcode.mockResolvedValue({
      valid: true,
      addresses: [{country: 'England'}],
    });
    mockGetCaseData.mockResolvedValue(new Claim());
    mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
    mockSaveClaimantProperty.mockResolvedValue(undefined);
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
  });

  const renderedParty = () => (res.render as jest.Mock).mock.calls[0][1].party;

  describe('Organisation Type', () => {
    describe('on Exception', () => {
      it('should call next when loading claimant information fails', async () => {
        const error = new Error('error');
        mockGetClaimantInformation.mockRejectedValue(error);

        await getHandler(req as AppRequest, res as unknown as Response, next);

        expect(next).toHaveBeenCalledWith(error);
      });

      it('should call next when save fails', async () => {
        const error = new Error('error');
        mockSaveClaimantProperty.mockRejectedValue(error);
        req.body = validDataForPost;

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(next).toHaveBeenCalledWith(error);
      });
    });

    it('should render organisation details page with empty information', async () => {
      const applicant = new Party();
      applicant.type = PartyType.ORGANISATION;
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.ORGANISATION,
        party: expect.any(GenericForm),
      }));
    });

    it('should render organisation details page with information', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.ORGANISATION));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.ORGANISATION,
        party: expect.any(GenericForm),
      }));
    });

    it('should re-render with contact person error when contact person is empty and CARM is on', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.ORGANISATION));
      req.body = {contactPerson: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        carmEnabled: true,
        party: expect.any(GenericForm),
      }));
      expect(renderedParty().hasErrors()).toBe(true);
      expect(renderedParty().hasFieldError('contactPerson')).toBe(true);
    });

    it('should re-render without mandatory contact person when CARM is off', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.ORGANISATION));
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
      req.body = {contactPerson: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        carmEnabled: false,
        party: expect.any(GenericForm),
      }));
      expect(renderedParty().hasFieldError('contactPerson')).toBe(false);
    });

    it('should render organisation details page without correspondent address', async () => {
      const applicant = new Party();
      applicant.partyDetails = new PartyDetails({});
      applicant.type = PartyType.ORGANISATION;
      applicant.partyDetails.title = 'title';
      applicant.partyDetails.firstName = 'firstName';
      applicant.partyDetails.lastName = 'lastName';
      applicant.partyDetails.primaryAddress = buildAddress();
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.ORGANISATION,
      }));
    });

    it('should render organisation details page with no primary, correspondence address or claimant details', async () => {
      const applicant = new Party();
      applicant.partyDetails = new PartyDetails({});
      applicant.partyDetails.primaryAddress = undefined;
      applicant.type = PartyType.ORGANISATION;
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.ORGANISATION,
      }));
    });

    it('should render organisation details page when there is no data on redis and civil-service', async () => {
      const applicant = new Party();
      applicant.type = PartyType.ORGANISATION;
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.ORGANISATION,
      }));
    });

    it('should redirect on correct primary address', async () => {
      mockGetClaimantInformation.mockResolvedValue(new Party());
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimantProperty).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect on correct correspondence address', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_PHONE_NUMBER_URL);
    });

    it('should re-render on empty primary address line', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary city', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary postcode', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['', ''],
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence address line', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', 'London'],
        postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence city', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence postcode', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', 'London'],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on no input', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary address when provideCorrespondenceAddress is no', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['', ''],
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence address when provideCorrespondenceAddress is yes', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should redirect to claimant phone number screen', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.ORGANISATION));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_PHONE_NUMBER_URL);
    });
  });

  describe('Company Type', () => {
    beforeEach(() => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
    });

    describe('on Exception', () => {
      it('should call next when loading claimant information fails', async () => {
        const error = new Error('error');
        mockGetClaimantInformation.mockRejectedValue(error);

        await getHandler(req as AppRequest, res as unknown as Response, next);

        expect(next).toHaveBeenCalledWith(error);
      });

      it('should call next when save fails', async () => {
        const error = new Error('error');
        mockSaveClaimantProperty.mockRejectedValue(error);
        req.body = validDataForPost;

        await postHandler(req as AppRequest, res as unknown as Response, next);

        expect(next).toHaveBeenCalledWith(error);
      });
    });

    it('should render company details page with empty information', async () => {
      const applicant = new Party();
      applicant.type = PartyType.COMPANY;
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.COMPANY,
        party: expect.any(GenericForm),
      }));
    });

    it('should render company details page with information', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.COMPANY));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.COMPANY,
      }));
    });

    it('should re-render with contact person error when contact person is empty and CARM is on', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.COMPANY));
      req.body = {contactPerson: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({carmEnabled: true}));
      expect(renderedParty().hasFieldError('contactPerson')).toBe(true);
    });

    it('should re-render without mandatory contact person when CARM is off', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantWithType(PartyType.COMPANY));
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
      req.body = {contactPerson: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({carmEnabled: false}));
      expect(renderedParty().hasFieldError('contactPerson')).toBe(false);
    });

    it('should render company details page without correspondent address', async () => {
      const applicant = new Party();
      applicant.partyDetails = new PartyDetails({});
      applicant.type = PartyType.COMPANY;
      applicant.partyDetails.title = 'title';
      applicant.partyDetails.firstName = 'firstName';
      applicant.partyDetails.lastName = 'lastName';
      applicant.partyDetails.primaryAddress = buildAddress();
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.COMPANY,
      }));
    });

    it('should render company details page with no primary, correspondence address or claimant details', async () => {
      const applicant = new Party();
      applicant.partyDetails = new PartyDetails({});
      applicant.type = PartyType.COMPANY;
      applicant.partyDetails.primaryAddress = undefined;
      mockGetClaimantInformation.mockResolvedValue(applicant);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        type: PartyType.COMPANY,
      }));
    });

    it('should redirect on correct primary address', async () => {
      mockGetClaimantInformation.mockResolvedValue(new Party());
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect on correct correspondence address', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_PHONE_NUMBER_URL);
    });

    it('should re-render on empty primary address line', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', 'London'],
        postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary city', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: 'Flat 3A Middle Road',
        addressLine2: '',
        addressLine3: '',
        city: '',
        postCode: 'SW1H 9AJ',
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary postcode', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: 'Flat 3A Middle Road',
        addressLine2: '',
        addressLine3: '',
        city: 'London',
        postCode: '',
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence address line', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', 'London'],
        postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence city', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence postcode', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', 'London'],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on no input', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty primary address when provideCorrespondenceAddress is no', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['', ''],
        postCode: ['', ''],
        provideCorrespondenceAddress: 'no',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should re-render on empty correspondence address when provideCorrespondenceAddress is yes', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = {
        addressLine1: ['Flat 3A Middle Road', ''],
        addressLine2: ['', ''],
        addressLine3: ['', ''],
        city: ['London', ''],
        postCode: ['SW1H 9AJ', ''],
        provideCorrespondenceAddress: 'yes',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedParty().hasErrors()).toBe(true);
    });

    it('should redirect to claimant phone number screen', async () => {
      mockGetClaimantInformation.mockResolvedValue(buildApplicantType(PartyType.COMPANY));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_PHONE_NUMBER_URL);
    });
  });
});
