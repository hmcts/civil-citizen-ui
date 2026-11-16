import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {DATE_PAID_CONFIRMATION_URL, DATE_PAID_URL} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {civilServiceClientMock} from '../../setup/sharedMocks';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {PartyType} from '../../../main/common/models/partyType';
import {ClaimantResponse} from '../../../main/common/models/claimantResponse';

const CLAIM_ID = '000MC6281';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.claimantResponse = new ClaimantResponse();
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

describe('Integration: claimant paid-in-full response', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    setDraftClaim(buildClaim());
    (civilServiceClientMock as unknown as {submitClaimSettled: jest.Mock}).submitClaimSettled = jest.fn().mockResolvedValue(undefined);
  });

  it('shows a validation error when the settlement date is left blank', async () => {
    const response = await request(app).post(route(DATE_PAID_URL)).send({day: '', month: '', year: ''});

    expect(response.status).toBe(200);
    expect(response.text).toContain('When did you settle with the defendant?');
    expect(response.text).toContain('Enter a valid day');
  });

  it('saves a settlement date and shows the confirmation', async () => {
    const postResponse = await request(app).post(route(DATE_PAID_URL)).send({day: '2', month: '1', year: '2026'});

    expect(postResponse.status).toBe(302);
    expect(postResponse.header.location).toContain('/paid-in-full/confirmation');

    const confirmation = await request(app).get(route(DATE_PAID_CONFIRMATION_URL));
    expect(confirmation.status).toBe(200);
    expect(confirmation.text).toContain('This claim is now settled');
  });
});
