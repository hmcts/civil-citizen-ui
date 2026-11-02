import {Response} from 'express';
import viewDefendantInformationController from 'routes/features/dashboard/viewDefendantInformationController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, VIEW_DEFENDANT_INFO} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isDefendantNoCOnlineForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDefendantNoCOnlineForCase: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/dashboard/contact-them-new';
const claimId = '12345';

const buildRespondent = (): Party => {
  const party = new Party();
  party.type = PartyType.ORGANISATION;
  party.partyPhone = new PartyPhone('111');
  party.partyDetails = new PartyDetails({
    title: 'Mx',
    firstName: 'Sam',
    lastName: 'Smith',
    partyName: 'Version 1',
    addressLine1: 'Flat 2',
    addressLine2: 'Caversham House 18',
    addressLine3: 'Church Road',
    city: 'Reading',
    postCode: 'RG4 7AA',
  });
  return party;
};

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.totalClaimAmount = 1000;
  claim.submittedDate = new Date('2024-01-01');
  claim.respondent1 = buildRespondent();
  claim.applicant1 = new Party();
  claim.applicant1.type = PartyType.INDIVIDUAL;
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewDefendantInformationController, 'get', VIEW_DEFENDANT_INFO)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('View Defendant Information', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isDefendantNoCOnlineForCase as jest.Mock).mockResolvedValue(false);
  });

  it('should render the defendant contact details', async () => {
    const claim = buildClaim();
    claim.caseRole = CaseRole.CLAIMANT;
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CONTACT_THEM.PAGE_TITLE_DEFENDANT',
      pageCaption: 'PAGES.CONTACT_THEM.THE_RESPONSE',
      otherPartyName: 'Version 1',
      party: claim.respondent1,
      defendantLRName: undefined,
      solicitorEmailId: undefined,
      claimId: caseNumberPrettify(claimId),
      claimAmount: 1000,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      address: expect.objectContaining({
        addressLine1: 'Flat 2',
        addressLine2: 'Caversham House 18',
        addressLine3: 'Church Road',
        postCode: 'RG4 7AA',
      }),
    }));
  });

  it('should render the defendant legal representative address after notice of change', async () => {
    const claim = buildClaim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
    claim.respondentSolicitorDetails = {
      address: {
        PostCode: 'NN3 9SS',
        PostTown: 'NORTHAMPTON',
        AddressLine1: '29, SEATON DRIVE',
      },
      orgName: 'Civil - Organisation 3',
    };
    (isDefendantNoCOnlineForCase as jest.Mock).mockResolvedValue(true);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      otherPartyName: 'PAGES.CONTACT_THEM.DEFENDANT_LR',
      party: undefined,
      defendantLRName: 'Civil - Organisation 3',
      solicitorEmailId: undefined,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
      address: expect.objectContaining({
        addressLine1: '29, SEATON DRIVE',
        city: 'NORTHAMPTON',
        postCode: 'NN3 9SS',
      }),
    }));
  });

  it('should render the correspondence address and solicitor email when those details were updated', async () => {
    const claim = buildClaim();
    claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
    claim.respondentSolicitor1EmailAddress = 'abc@gmail.com';
    claim.respondentSolicitorDetails = {
      address: {
        PostCode: 'NN3 9SS',
        PostTown: 'NORTHAMPTON',
        AddressLine1: '29, SEATON DRIVE',
      },
    };
    claim.specRespondentCorrespondenceAddressRequired = YesNoUpperCamelCase.YES;
    claim.specRespondentCorrespondenceAddressdetails = {
      PostCode: 'L7 2PZ',
      PostTown: 'ABC',
      AddressLine1: '26, SEATON DRIVE',
    };
    (isDefendantNoCOnlineForCase as jest.Mock).mockResolvedValue(true);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      otherPartyName: 'PAGES.CONTACT_THEM.DEFENDANT_LR',
      solicitorEmailId: 'abc@gmail.com',
      defendantLRName: undefined,
      address: expect.objectContaining({
        addressLine1: '26, SEATON DRIVE',
        city: 'ABC',
        postCode: 'L7 2PZ',
      }),
    }));
  });

  it('should call next when claim retrieval fails', async () => {
    const error = new Error('claim retrieval failed');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
