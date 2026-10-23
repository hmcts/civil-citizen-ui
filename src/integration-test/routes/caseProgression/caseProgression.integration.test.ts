import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL,
  REQUEST_FOR_RECONSIDERATION_CYA_URL,
  REQUEST_FOR_RECONSIDERATION_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {PartyType} from '../../../main/common/models/partyType';
import {YesNo} from '../../../main/common/form/models/yesNo';

const CLAIM_ID = '000MC6281';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 15000;
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

describe('Integration: case progression trial arrangements, documents and reconsideration', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    setDraftClaim(buildClaim());
  });

  it('asks whether the case is ready and continues when the claimant answers yes', async () => {
    const page = await request(app).get(route(IS_CASE_READY_URL));
    expect(page.status).toBe(200);
    expect(page.text).toContain('Is the case ready for trial?');

    const invalid = await request(app).post(route(IS_CASE_READY_URL)).send({});
    expect(invalid.status).toBe(200);
    expect(invalid.text).toContain('Select Yes or No');

    const valid = await request(app).post(route(IS_CASE_READY_URL)).send({option: YesNo.YES});
    expect(valid.status).toBe(302);
    expect(valid.header.location).toContain(route(HAS_ANYTHING_CHANGED_URL));
  });

  it('renders the upload-documents start page', async () => {
    const response = await request(app).get(route(UPLOAD_YOUR_DOCUMENTS_URL));

    expect(response.status).toBe(200);
    expect(response.text).toContain('Upload your documents');
  });

  it('accepts a request to review an order and continues to check your answers', async () => {
    const page = await request(app).get(route(REQUEST_FOR_RECONSIDERATION_URL));
    expect(page.status).toBe(200);
    expect(page.text).toContain('How and why do you want the order changed?');

    const postResponse = await request(app).post(route(REQUEST_FOR_RECONSIDERATION_URL)).send({textArea: 'The hearing date should move'});
    expect(postResponse.status).toBe(302);
    expect(postResponse.header.location).toContain(route(REQUEST_FOR_RECONSIDERATION_CYA_URL));
  });
});
