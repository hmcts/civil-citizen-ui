import {Response} from 'express';
import viewClaimantInformationController from 'routes/features/dashboard/viewClaimantInformationController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, VIEW_CLAIMANT_INFO} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {Email} from 'models/Email';
import {CaseRole} from 'form/models/caseRoles';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';
import {CanWeUse} from 'models/mediation/canWeUse';
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

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/dashboard/contact-them-new';
const claimId = '123';

const buildApplicant = (): Party => {
  const party = new Party();
  party.type = PartyType.INDIVIDUAL;
  party.partyDetails = new PartyDetails({
    title: 'Mrs',
    firstName: 'Jane',
    lastName: 'Clark',
    partyName: 'Mrs Jane Clark',
    addressLine1: 'Flat 2',
    addressLine2: 'Caversham House 18',
    addressLine3: 'Church Road',
    city: 'Reading',
    postCode: 'RG4 7AA',
  });
  party.emailAddress = new Email('existing-claimant@test.com');
  party.partyPhone = new PartyPhone('07111111111');
  return party;
};

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 500;
  claim.applicant1 = buildApplicant();
  claim.respondent1 = new Party();
  return claim;
};

const withFallbackContact = (claim: Claim): void => {
  (claim as unknown as {claimantUserDetails?: {email: string; id: string}}).claimantUserDetails = {
    email: 'fallback-claimant@test.com',
    id: 'id-1',
  };
  const claimantResponse = new ClaimantResponse();
  const mediation = new Mediation();
  mediation.canWeUse = {mediationPhoneNumber: '07000000000'} as CanWeUse;
  claimantResponse.mediation = mediation;
  claim.claimantResponse = claimantResponse;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(viewClaimantInformationController, 'get', VIEW_CLAIMANT_INFO)(
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

const renderedParty = (res: ReturnType<typeof createMockResponse>): Party =>
  (res.render as jest.Mock).mock.calls[0][1].party as Party;

describe('View claimant information', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the claimant contact details and claimant dashboard link', async () => {
    const claim = buildClaim();
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CONTACT_THEM.PAGE_TITLE_CLAIMANT',
      pageCaption: 'PAGES.CONTACT_THEM.THE_CLAIM',
      otherPartyName: 'Mrs Jane Clark',
      claimId: caseNumberPrettify(claimId),
      claimAmount: 500,
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      address: expect.objectContaining({
        addressLine1: 'Flat 2',
        addressLine2: 'Caversham House 18',
        addressLine3: 'Church Road',
        postCode: 'RG4 7AA',
      }),
    }));
    expect(renderedParty(res).emailAddress?.emailAddress).toBe('existing-claimant@test.com');
    expect(renderedParty(res).partyPhone?.phone).toBe('07111111111');
  });

  it('should use fallback claimant email and phone when applicant contact details are missing', async () => {
    const claim = buildClaim();
    claim.applicant1.emailAddress = undefined;
    claim.applicant1.partyPhone = undefined;
    withFallbackContact(claim);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();
    const party = renderedParty(res);

    expect(party.emailAddress?.emailAddress).toBe('fallback-claimant@test.com');
    expect(party.partyPhone?.phone).toBe('07000000000');
  });

  it('should leave claimant email empty when no fallback email exists', async () => {
    const claim = buildClaim();
    claim.applicant1.emailAddress = undefined;
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(renderedParty(res).emailAddress).toBeUndefined();
  });

  it('should keep existing claimant email and phone', async () => {
    const claim = buildClaim();
    withFallbackContact(claim);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();
    const party = renderedParty(res);

    expect(party.emailAddress?.emailAddress).toBe('existing-claimant@test.com');
    expect(party.partyPhone?.phone).toBe('07111111111');
  });

  it('should point the dashboard link at the defendant summary for a defendant', async () => {
    const claim = buildClaim();
    claim.caseRole = CaseRole.DEFENDANT;
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL),
    }));
  });

  it('should call next when claim retrieval fails', async () => {
    const error = new Error('claim retrieval failed');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
