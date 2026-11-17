import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {PartyType} from '../../../main/common/models/partyType';

const CLAIM_ID = '000MC6284';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.DEFENDANT;
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

describe('Integration: defendant settlement agreement', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    const claim = buildClaim();
    setDraftClaim(claim);
    civilServiceClientMock.retrieveClaimDetails.mockResolvedValue(claim);
  });

  it('shows the settlement agreement page', async () => {
    const response = await request(app).get(route(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT));

    expect(response.status).toBe(200);
    expect(response.text).toContain('Respond to the settlement agreement');
  });

  it('shows a validation error when no option is chosen', async () => {
    const response = await request(app).post(route(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT)).send({});

    expect(response.status).toBe(200);
    expect(response.text).toContain('Respond to the settlement agreement');
    expect(response.text).toContain('Select Yes - I confirm I have read and accept the terms of the agreement if you want to accept the agreement');
  });
});
