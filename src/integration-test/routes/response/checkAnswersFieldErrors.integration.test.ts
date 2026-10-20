import request from 'supertest';
import {NextFunction} from 'express';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('routes/guards/allResponseTasksCompletedGuard', () => ({
  AllResponseTasksCompletedGuard: {
    apply: () => (_req: unknown, _res: unknown, next: NextFunction) => next(),
  },
}));

jest.mock('routes/guards/pcqGuard', () => ({
  isFirstTimeInPCQ: (_req: unknown, _res: unknown, next: NextFunction) => next(),
}));

jest.mock('services/features/response/checkAnswers/checkAnswersService', () => {
  const actual = jest.requireActual(
    '../../../main/services/features/response/checkAnswers/checkAnswersService',
  );
  return {
    ...actual,
    saveStatementOfTruth: jest.fn().mockResolvedValue(undefined),
    getSummarySections: jest.fn().mockReturnValue({sections: []}),
  };
});

jest.mock('services/features/response/submission/submitResponse', () => ({
  submitResponse: jest.fn(),
}));

import {app} from '../../../main/app';
import {RESPONSE_CHECK_ANSWERS_URL} from '../../../main/routes/urls';
import {asUser, installSessionUserInjector} from '../../setup/sessionHelper';
import {Claim} from '../../../main/common/models/claim';
import {CallbackError} from '../../../main/app/client/common/error/callbackError';
import {submitResponse} from '../../../main/services/features/response/submission/submitResponse';

const CLAIM_ID = 'field-errors-claim';
const USER_ID = 'field-errors-user';
const checkAnswersUrl = RESPONSE_CHECK_ANSWERS_URL.replace(':id', CLAIM_ID);
const mockSubmitResponse = submitResponse as jest.MockedFunction<typeof submitResponse>;

const createDraftStoreClient = (claim: Claim) => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify({
    id: claim.id,
    case_data: claim,
  }))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
});

describe('Integration: response check-answers field_errors 422', () => {
  beforeAll(() => {
    installSessionUserInjector();
  });

  beforeEach(() => {
    const claim = new Claim();
    claim.id = CLAIM_ID;
    app.locals.draftStoreClient = createDraftStoreClient(claim);
  });

  it('should remount CYA with GDS error summary links and inline messages on field_errors', async () => {
    mockSubmitResponse.mockRejectedValue(new CallbackError(
      [],
      [],
      [{id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'}],
    ));

    const response = await request(app)
      .post(checkAnswersUrl)
      .set(asUser(USER_ID))
      .send({signed: 'true'});

    expect(response.status).toBe(200);
    expect(response.text).toContain('govuk-error-summary');
    expect(response.text).toContain('notanemail is not a valid Email address');
    expect(response.text).toContain('href="#ccd-field-respondent1-partyEmail"');
    expect(response.text).toContain('id="ccd-field-respondent1-partyEmail"');
    expect(response.text).toContain('govuk-error-message');
  });

  it('should keep the error page for callbackErrors-only 422', async () => {
    mockSubmitResponse.mockRejectedValue(new CallbackError([
      'There is a technical issue causing a delay. You do not need to do anything. Please come back later.',
    ]));

    const response = await request(app)
      .post(checkAnswersUrl)
      .set(asUser(USER_ID))
      .send({signed: 'true'});

    expect(response.status).toBe(422);
    expect(response.text).toContain('There is a technical issue causing a delay');
    expect(response.text).not.toContain('href="#ccd-field-');
  });

  it('should keep the error page with go-back when field_errors are mixed with callbackErrors', async () => {
    mockSubmitResponse.mockRejectedValue(new CallbackError(
      ['Business process must be finished before you can submit'],
      [],
      [{id: 'respondent1.partyEmail', message: 'notanemail is not a valid Email address'}],
    ));

    const response = await request(app)
      .post(checkAnswersUrl)
      .set(asUser(USER_ID))
      .send({signed: 'true'});

    expect(response.status).toBe(422);
    expect(response.text).toContain('Business process must be finished');
    expect(response.text).toContain('notanemail is not a valid Email address');
    expect(response.text).toContain(`href="${checkAnswersUrl}"`);
    expect(response.text).toContain('Go back and amend');
  });
});
