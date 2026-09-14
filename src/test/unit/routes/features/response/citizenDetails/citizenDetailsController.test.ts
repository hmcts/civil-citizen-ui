import {Response} from 'express';
import citizenDetailsController from '../../../../../../main/routes/features/response/citizenDetails/citizenDetailsController';
import {CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getDefendantInformation, saveDefendantProperty} from 'services/features/common/defendantDetailsService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {buildAddress} from '../../../../../utils/mockClaim';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/common/defendantDetailsService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('modules/ordance-survey-key/ordanceSurveyKeyService', () => ({
  lookupByPostcodeAndDataSet: jest.fn(),
}));
jest.mock('services/features/claim/yourDetails/phoneService', () => ({
  saveTelephone: jest.fn(),
  getTelephone: jest.fn(),
}));

const mockGetRespondentInformation = getDefendantInformation as jest.Mock;
const mockSaveRespondent = saveDefendantProperty as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockLookupByPostcode = lookupByPostcodeAndDataSet as jest.Mock;

const companyViewPath = 'features/response/citizenDetails/citizen-details-company';
const individualViewPath = 'features/response/citizenDetails/citizen-details';

const buildClaimOfRespondent = (): Party => {
  const respondent = new Party();
  respondent.partyDetails = new PartyDetails({});
  respondent.partyDetails.title = 'title';
  respondent.partyDetails.firstName = 'firstName';
  respondent.partyDetails.lastName = 'lastName';
  respondent.partyDetails.primaryAddress = buildAddress();
  respondent.partyDetails.correspondenceAddress = buildAddress();
  return respondent;
};

const buildClaimOfRespondentType = (type: PartyType): Party => {
  const respondent = new Party();
  respondent.partyDetails = new PartyDetails({});
  respondent.type = type;
  respondent.partyDetails.primaryAddress = buildAddress();
  respondent.partyDetails.correspondenceAddress = buildAddress();
  return respondent;
};

const buildClaimOfRespondentTypeWithCcdPhone = (type: PartyType): Party => {
  const respondent = buildClaimOfRespondentType(type);
  respondent.partyPhone = new PartyPhone();
  respondent.partyPhone.phone = '123456';
  respondent.partyPhone.ccdPhoneExist = true;
  return respondent;
};

const buildClaimOfRespondentTypeWithoutCcdPhone = (type: PartyType): Party => {
  const respondent = buildClaimOfRespondentType(type);
  respondent.partyPhone = new PartyPhone();
  respondent.partyPhone.phone = '123456';
  return respondent;
};

const validDataForPost = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['', ''],
  addressLine3: ['', ''],
  city: ['London', 'London'],
  postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
  postToThisAddress: 'no',
};

describe('Confirm Details page', () => {
  const getHandler = getRouteHandler(citizenDetailsController, 'get');
  const postHandler = getRouteHandler(citizenDetailsController, 'post');
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
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
    const mockClaim = new Claim();
    mockClaim.submittedDate = new Date(2024, 5, 23);
    mockGetCaseData.mockResolvedValue(mockClaim);
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    mockGetRespondentInformation.mockResolvedValue(new Party());
    mockSaveRespondent.mockResolvedValue(undefined);
  });

  const renderedParty = () => (res.render as jest.Mock).mock.calls[0][1].party;

  describe('on Exception', () => {
    it('should call next when loading defendant information fails', async () => {
      const error = new Error('error');
      mockGetRespondentInformation.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveRespondent.mockRejectedValue(error);
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  it('should render your details page with empty information', async () => {
    mockGetRespondentInformation.mockResolvedValue(new Party());

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(individualViewPath, expect.objectContaining({
      party: expect.any(GenericForm),
      carmEnabled: true,
    }));
  });

  it('should render your details page with information', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondent());

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(individualViewPath, expect.objectContaining({
      party: expect.any(GenericForm),
    }));
  });

  it('should render your details page with information without correspondent address', async () => {
    const respondent = new Party();
    respondent.partyDetails = new PartyDetails({});
    respondent.partyDetails.title = 'title';
    respondent.partyDetails.firstName = 'firstName';
    respondent.partyDetails.lastName = 'lastName';
    respondent.partyDetails.primaryAddress = buildAddress();
    mockGetRespondentInformation.mockResolvedValue(respondent);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(individualViewPath, expect.objectContaining({
      party: expect.any(GenericForm),
    }));
  });

  it('should render your details company page', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.COMPANY));

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      type: PartyType.COMPANY,
      party: expect.any(GenericForm),
    }));
  });

  it('should re-render with contact person error when contact person is empty - company', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.COMPANY));
    req.body = {contactPerson: ''};

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      carmEnabled: true,
      type: PartyType.COMPANY,
      party: expect.any(GenericForm),
    }));
    expect(renderedParty().hasErrors()).toBe(true);
    expect(renderedParty().hasFieldError('contactPerson')).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should re-render without mandatory contact person when CARM is off - company', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.COMPANY));
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    req.body = {contactPerson: 'Joe Bloggs'};

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      carmEnabled: false,
      type: PartyType.COMPANY,
    }));
    expect(renderedParty().hasFieldError('contactPerson')).toBe(false);
  });

  it('should render your details organisation page', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      type: PartyType.ORGANISATION,
      party: expect.any(GenericForm),
    }));
  });

  it('should re-render with contact person error when contact person is empty - organisation', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
    req.body = {contactPerson: ''};

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      carmEnabled: true,
      type: PartyType.ORGANISATION,
    }));
    expect(renderedParty().hasErrors()).toBe(true);
    expect(renderedParty().hasFieldError('contactPerson')).toBe(true);
  });

  it('should re-render without mandatory contact person when CARM is off - organisation', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    req.body = {contactPerson: 'Joe Bloggs'};

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(companyViewPath, expect.objectContaining({
      carmEnabled: false,
      type: PartyType.ORGANISATION,
    }));
    expect(renderedParty().hasFieldError('contactPerson')).toBe(false);
  });

  it('should redirect on correct primary address', async () => {
    req.body = {
      addressLine1: ['Flat 3A Middle Road', ''],
      addressLine2: ['', ''],
      addressLine3: ['', ''],
      city: ['London', ''],
      postCode: ['SW1H 9AJ', ''],
      postToThisAddress: 'no',
    };

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(mockSaveRespondent).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });

  it('should re-render on empty primary address line', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.INDIVIDUAL));
    req.body = {
      addressLine1: ['', ''],
      addressLine2: ['', ''],
      addressLine3: ['', ''],
      city: ['London', ''],
      postCode: ['SW1H 9AJ', ''],
      postToThisAddress: 'no',
    };

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(individualViewPath, expect.objectContaining({
      party: expect.any(GenericForm),
    }));
    expect(renderedParty().hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should re-render on empty primary city', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
    req.body = {
      addressLine1: ['Flat 3A Middle Road', ''],
      addressLine2: ['', ''],
      addressLine3: ['', ''],
      city: ['', ''],
      postCode: ['SW1H 9AJ', ''],
      postToThisAddress: 'no',
    };

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(renderedParty().hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should re-render on empty primary postcode', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
    req.body = {
      addressLine1: ['Flat 3A Middle Road', ''],
      addressLine2: ['', ''],
      addressLine3: ['', ''],
      city: ['London', ''],
      postCode: ['', ''],
      postToThisAddress: 'no',
    };

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(renderedParty().hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should re-render on empty primary address when postToThisAddress is no', async () => {
    mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
    req.body = {
      addressLine1: ['', ''],
      addressLine2: ['', ''],
      addressLine3: ['', ''],
      city: ['', ''],
      postCode: ['', ''],
      postToThisAddress: 'no',
    };

    await postHandler(req as AppRequest, res as unknown as Response, next);

    expect(renderedParty().hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  describe('Redirect to Phone or DOB screen (phone number not provided)', () => {
    it('should redirect to confirm phone screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.COMPANY));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should redirect to confirm phone screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.ORGANISATION));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.INDIVIDUAL));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DOB_URL));
    });

    it('should redirect to confirm your phone screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentType(PartyType.SOLE_TRADER));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });
  });

  describe('Redirect to Phone or DOB screen (phone number provided)', () => {
    it('should redirect to task-list screen if respondent type is COMPANY', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentTypeWithCcdPhone(PartyType.COMPANY));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to task-list screen if respondent type is ORGANISATION', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentTypeWithCcdPhone(PartyType.ORGANISATION));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to confirm DOB screen if respondent type is INDIVIDUAL', async () => {
      mockGetRespondentInformation.mockResolvedValue({
        ...buildClaimOfRespondentType(PartyType.INDIVIDUAL),
        partyPhone: '123456',
      });
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DOB_URL));
    });

    it('should redirect to task-list screen if respondent type is SOLE TRADER', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentTypeWithCcdPhone(PartyType.SOLE_TRADER));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to phone screen if respondent type is SOLE TRADER and ccd phone is not provided', async () => {
      mockGetRespondentInformation.mockResolvedValue(buildClaimOfRespondentTypeWithoutCcdPhone(PartyType.SOLE_TRADER));
      req.body = validDataForPost;

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });
  });
});
