import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {
  CAN_WE_USE_COMPANY_URL,
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
  RESPONSE_TASK_LIST_URL,
  TELEPHONE_MEDIATION_URL,
} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {PartyType} from '../../../main/common/models/partyType';

const CLAIM_ID = '000MC6281';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {partyName: 'Alex Defendant', firstName: 'Alex', lastName: 'Defendant'},
  } as Claim['respondent1'];
  return claim;
};

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = {
    set: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve(JSON.stringify({id: claim.id, case_data: claim}))),
    del: jest.fn(() => Promise.resolve({})),
    ttl: jest.fn(() => Promise.resolve(-1)),
    expireat: jest.fn(() => Promise.resolve({})),
  };
};

describe('Integration: mediation contact details', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    setDraftClaim(buildClaim());
  });

  it('renders free telephone mediation and continues from the telephone mediation page', async () => {
    const freeMediation = await request(app).get(route(CITIZEN_FREE_TELEPHONE_MEDIATION_URL));
    expect(freeMediation.status).toBe(200);
    expect(freeMediation.text).toContain('We have automatically registered you for free telephone mediation');

    const telephonePage = await request(app).get(route(TELEPHONE_MEDIATION_URL));
    expect(telephonePage.status).toBe(200);
    expect(telephonePage.text).toContain('Telephone mediation');

    const continueResponse = await request(app).post(route(TELEPHONE_MEDIATION_URL)).send({});
    expect(continueResponse.status).toBe(302);
    expect(continueResponse.header.location).toContain(route(RESPONSE_TASK_LIST_URL));
  });

  it('shows a validation error when the company mediation phone is left blank', async () => {
    const response = await request(app).post(route(CAN_WE_USE_COMPANY_URL)).send({});

    expect(response.status).toBe(200);
    expect(response.text).toContain('Who should the mediation service call?');
    expect(response.text).toContain('Please enter a name');
  });
});
