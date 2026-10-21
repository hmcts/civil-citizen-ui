import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {app} from '../../../main/app';
import {
  APPLY_HELP_WITH_FEES,
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
} from '../../../main/routes/urls';
import {createClaimWithBasicApplicantDetails} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {FeeType} from '../../../main/common/form/models/helpWithFees/feeType';
import {CaseProgressionHearing} from '../../../main/common/models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from '../../../main/common/models/caseProgression/hearingFee/hearingFee';

const CLAIM_ID = '000MC6285';

const route = (url: string): string => url.replace(':id', CLAIM_ID);

const buildClaim = (): Claim => {
  const claim = createClaimWithBasicApplicantDetails();
  claim.id = CLAIM_ID;
  claim.caseRole = CaseRole.CLAIMANT;
  claim.totalClaimAmount = 1000;
  claim.feeTypeHelpRequested = FeeType.HEARING;
  claim.caseProgressionHearing = new CaseProgressionHearing();
  claim.caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation({
    calculatedAmountInPence: '7000',
    version: '1',
    code: '1',
  });
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

describe('Integration: help with fees and judgment confirmation', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    setDraftClaim(buildClaim());
  });

  it('renders the help with fees page', async () => {
    const response = await request(app).get(route(APPLY_HELP_WITH_FEES));

    expect(response.status).toBe(200);
    expect(response.text).toContain('Help with fees');
  });

  it('renders the confirm you have been paid form and rejects a blank date', async () => {
    const formUrl = route(CONFIRM_YOU_HAVE_BEEN_PAID_URL);
    const getResponse = await request(app).get(formUrl);

    expect(getResponse.status).toBe(200);
    expect(getResponse.text).toContain('Confirm that you&#39;ve been paid');

    const postResponse = await request(app).post(formUrl).send({day: '', month: '', year: ''});

    expect(postResponse.status).toBe(200);
    expect(postResponse.text).toContain('Enter a valid day');
  });

  it('renders the judgment paid confirmation page', async () => {
    const response = await request(app).get(route(CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL));

    expect(response.status).toBe(200);
    expect(response.text).toContain('You&#39;ve confirmed that you&#39;ve been paid');
  });
});
