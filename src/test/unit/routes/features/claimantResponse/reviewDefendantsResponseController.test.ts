import {Response} from 'express';
import reviewDefendantsResponseController from 'routes/features/claimantResponse/reviewDefendantsResponseController';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {constructRepaymentPlanSection, getFinancialDetails, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getDefendantResponseLink, getDefendantsResponseContent, getResponseContentForHowTheyWantToPay} from 'services/features/claimantResponse/defendantResponse/defendantResponseSummaryService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {StatementOfMeans} from 'models/statementOfMeans';
import {CaseState} from 'form/models/claimDetails';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService', () => ({
  saveClaimantResponse: jest.fn(),
  getFinancialDetails: jest.fn((): unknown[] => []),
  constructRepaymentPlanSection: jest.fn((): unknown[] => []),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
}));
jest.mock('services/features/claimantResponse/defendantResponse/defendantResponseSummaryService', () => ({
  getDefendantResponseLink: jest.fn(() => 'download-link'),
  getDefendantsResponseContent: jest.fn((): unknown[] => []),
  getResponseContentForHowTheyWantToPay: jest.fn(() => [{type: 'paragraph'}]),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const reviewViewPath = 'features/claimantResponse/review-defendants-response';
const howTheyWantToPayViewPath = 'features/claimantResponse/how-they-want-to-pay-response';
const claimId = '12345';
const pageParam = 'how-they-want-to-pay-response';

const reviewClaim = (): Claim => {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.statementOfMeans = new StatementOfMeans();
  return claim;
};

const payByDateClaim = (): Claim => {
  const claim = reviewClaim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  claim.partialAdmission.paymentIntention.paymentDate = new Date('2026-12-01');
  return claim;
};

const fullAdmissionClaim = (): Claim => {
  const claim = reviewClaim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(reviewDefendantsResponseController, method, CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Review Defendant\'s Response Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(reviewClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getFinancialDetails as jest.Mock).mockReturnValue([]);
    (constructRepaymentPlanSection as jest.Mock).mockReturnValue([]);
    (getDefendantResponseLink as jest.Mock).mockReturnValue('download-link');
    (getDefendantsResponseContent as jest.Mock).mockReturnValue([]);
    (getResponseContentForHowTheyWantToPay as jest.Mock).mockReturnValue([{type: 'paragraph'}]);
  });

  it('should return defendant\'s response', async () => {
    const claim = reviewClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke('get');

    expect(res.render).toHaveBeenCalledWith(reviewViewPath, expect.objectContaining({
      claim,
      pageTitle: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAGE_TITLE',
      financialDetails: [],
    }));
  });

  it('should return error page on redis failure', async () => {
    const error = new Error('redis failure');
    (getClaimById as jest.Mock).mockRejectedValue(error);

    const {next} = await invoke('get');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should render how they want to pay when the page query is set for pay by date', async () => {
    const claim = payByDateClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke('get', {query: {page: pageParam}});

    expect(res.render).toHaveBeenCalledWith(howTheyWantToPayViewPath, expect.objectContaining({
      claim,
      continueLink: constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL),
    }));
  });

  it('should render how they want to pay on post when the defendant will pay by a set date', async () => {
    const claim = payByDateClaim();
    (getClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke('post');

    expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, true, 'defendantResponseViewed');
    expect(res.render).toHaveBeenCalledWith(howTheyWantToPayViewPath, expect.objectContaining({claim}));
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to claimant response task list.', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(fullAdmissionClaim());

    const {res} = await invoke('post');

    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
  });
});
