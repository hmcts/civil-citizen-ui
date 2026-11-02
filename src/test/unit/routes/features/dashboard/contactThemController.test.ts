import {Response} from 'express';
import i18next, {t} from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import contactThemController from 'routes/features/dashboard/contactThemController';
import {CITIZEN_CONTACT_THEM_URL, CLAIM_DETAILS_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {CaseRole} from 'form/models/caseRoles';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const viewPath = 'features/dashboard/contact-them';
const claimId = '123';

const buildParty = (partyName: string): Party => {
  const party = new Party();
  party.type = PartyType.ORGANISATION;
  party.partyDetails = new PartyDetails({
    title: 'Mx',
    firstName: 'Sam',
    lastName: 'Smith',
    partyName,
    addressLine1: 'Flat 2',
    addressLine2: 'Caversham House 18',
    addressLine3: 'Church Road',
    city: 'Reading',
    postCode: 'RG4 7AA',
  });
  return party;
};

const buildClaim = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.applicant1 = buildParty('Jane Clark');
  claim.respondent1 = buildParty('Version 1');
  return claim;
};

const invoke = async (lang?: string) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(contactThemController, 'get', CITIZEN_CONTACT_THEM_URL)(
    {
      params: {id: claimId},
      body: {},
      query: lang ? {lang} : {},
      cookies: {lang: 'en'},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Contact them controller', () => {
  beforeAll(async () => {
    if (!i18next.isInitialized) {
      await i18next.use(Backend).init({
        backend: {
          loadPath: path.join(__dirname, '../../../../../main/modules/i18n/locales/{{lng}}.json'),
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'cy'],
        load: 'languageOnly',
        initImmediate: false,
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the defendant contact details for a claimant', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    (getClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      claim,
      party: claim.respondent1,
      otherPartyName: 'Version 1',
      otherParty: t('PAGES.CONTACT_THEM.DEFENDANT', {lng: 'en'}),
      claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      claimDetailsUrl: constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL),
      showInR1: false,
      address: expect.objectContaining({
        addressLine1: 'Flat 2',
        addressLine2: 'Caversham House 18',
        addressLine3: 'Church Road',
        postCode: 'RG4 7AA',
      }),
    }));
  });

  it('should render the claimant contact details for a defendant', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT);
    (getClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      party: claim.applicant1,
      otherPartyName: 'Jane Clark',
      otherParty: t('PAGES.CONTACT_THEM.CLAIMANT', {lng: 'en'}),
    }));
  });

  it('should translate the other party label when the language query is Welsh', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

    const {res} = await invoke('cy');

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      otherParty: t('PAGES.CONTACT_THEM.DEFENDANT', {lng: 'cy'}),
    }));
  });

  it('should call next when the claim cannot be loaded', async () => {
    const error = new Error('claim retrieval failed');
    (getClaimById as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
