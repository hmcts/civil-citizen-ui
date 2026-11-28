import request from 'supertest';
import {NextFunction} from 'express';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';
import {civilServiceClientMock} from '../../setup/sharedMocks';

jest.mock('routes/guards/allResponseTasksCompletedGuard', () => ({
  AllResponseTasksCompletedGuard: {
    apply: () => (_req: unknown, _res: unknown, next: NextFunction) => next(),
  },
}));

jest.mock('routes/guards/pcqGuard', () => ({
  isFirstTimeInPCQ: (_req: unknown, _res: unknown, next: NextFunction) => next(),
}));

import {app} from '../../../main/app';
import {RESPONSE_CHECK_ANSWERS_URL} from '../../../main/routes/urls';
import {
  createClaimWithBasicApplicantDetails,
  createClaimWithFullRejection,
} from '../../../test/utils/mockClaimForCheckAnswers';
import * as draftStoreService from '../../../main/modules/draft-store/draftStoreService';
import {
  isCarmEnabledForCase,
  isMintiEnabledForCase,
} from '../../../main/app/auth/launchdarkly/launchDarklyClient';
import {RejectAllOfClaimType} from '../../../main/common/form/models/rejectAllOfClaimType';
import {StatementOfMeans} from '../../../main/common/models/statementOfMeans';
import {CourtOrders} from '../../../main/common/form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from '../../../main/common/form/models/statementOfMeans/courtOrders/courtOrder';
import {Claim} from '../../../main/common/models/claim';

const CLAIM_ID = '000MC123';
const CLAIM_NUMBER_ERROR = 'Enter a claim number using only letters and numbers';

const buildClaimWithCourtOrderClaimNumber = (claimNumber: string): Claim => {
  const claim = createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE);
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.submittedDate = new Date('2026-01-02T09:00:00.000Z');
  claim.respondent1ResponseDeadline = new Date('2050-05-15T00:00:00.000Z');
  claim.applicant1 = createClaimWithBasicApplicantDetails().applicant1;
  claim.statementOfMeans = new StatementOfMeans();
  claim.statementOfMeans.courtOrders = new CourtOrders(true, [new CourtOrder(500, 20, claimNumber)]);
  return claim;
};

const setDraftClaim = (claim: Claim) => {
  app.locals.draftStoreClient = {
    set: jest.fn(() => Promise.resolve({})),
    get: jest.fn(() => Promise.resolve(JSON.stringify({id: claim.id, case_data: claim}))),
    del: jest.fn(() => Promise.resolve({})),
    ttl: jest.fn(() => Promise.resolve({})),
    expireat: jest.fn(() => Promise.resolve({})),
  };
};

describe('Integration: response check answers with stored court orders', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isMintiEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  it('shows the claim number error instead of submitting when a stored claim number is not alphanumeric', async () => {
    setDraftClaim(buildClaimWithCourtOrderClaimNumber('H0QZ/1234'));

    await request(app)
      .post(RESPONSE_CHECK_ANSWERS_URL.replace(':id', CLAIM_ID))
      .send({type: 'basic', signed: 'true', directionsQuestionnaireSigned: 'true'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Check your answers');
        expect(res.text).toContain(CLAIM_NUMBER_ERROR);
      });

    expect(civilServiceClientMock.submitDefendantResponseEvent).not.toHaveBeenCalled();
  });
});
