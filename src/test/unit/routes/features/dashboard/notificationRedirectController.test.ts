import {Response} from 'express';
import notificationRedirectController from 'routes/features/dashboard/notificationRedirectController';
import {
  BUNDLES_URL,
  CASE_DOCUMENT_VIEW_URL,
  DASHBOARD_CLAIMANT_URL,
  DASHBOARD_NOTIFICATION_REDIRECT,
  DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT,
  DEFENDANT_SUMMARY_URL,
  QM_VIEW_QUERY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {checkWelshHearingNotice} from 'services/features/caseProgression/hearing/hearingService';
import {Claim, PreTranslationDocumentType} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {DocumentType} from 'models/document/documentType';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
    recordClick: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionService', () => ({
  getRedirectUrl: jest.fn(),
}));
jest.mock('services/features/caseProgression/hearing/hearingService', () => ({
  checkWelshHearingNotice: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
  recordClick: jest.Mock;
};

const claimId = '123';
const notificationId = '321';
const paymentUrl = 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960';
const englishDocumentUrl = 'http://dm-store:8080/documents/456/binary';
const welshDocumentUrl = 'http://dm-store:8080/documents/ab5417ae-0004-4765-9b92-4c4680d7680e/binary';

const buildClaim = (caseRole: CaseRole = CaseRole.DEFENDANT): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  return claim;
};

const hearingWithDocuments = (englishUrl?: string, welshUrl?: string): CaseProgressionHearing => ({
  hearingDocuments: englishUrl === undefined
    ? undefined
    : [{value: {documentLink: {document_binary_url: englishUrl}}}],
  hearingDocumentsWelsh: welshUrl
    ? [{value: {documentLink: {document_binary_url: welshUrl}}}]
    : undefined,
} as unknown as CaseProgressionHearing);

const invoke = async (
  path: string,
  params: Record<string, string>,
  query: Record<string, string> = {},
) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(notificationRedirectController, 'get', path)(
    {
      params,
      query,
      cookies: {},
      body: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const redirectParams = (locationName: string): Record<string, string> => ({
  id: claimId,
  locationName,
  notificationId,
});

describe('Notification redirect controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    civilServiceMethods.recordClick.mockResolvedValue(undefined);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim());
    (generateRedisKey as jest.Mock).mockReturnValue('redis-key');
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (getRedirectUrl as jest.Mock).mockResolvedValue(paymentUrl);
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(false);
  });

  it('should redirect an orders and notices notification and record the click', async () => {
    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_ORDERS_AND_NOTICES'));

    expect(civilServiceMethods.recordClick).toHaveBeenCalledWith(notificationId, expect.anything());
    expect(res.redirect).toHaveBeenCalledWith(VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId));
  });

  it('should redirect a bundle notification to the bundles page', async () => {
    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_BUNDLE'));

    expect(res.redirect).toHaveBeenCalledWith(BUNDLES_URL.replace(':id', claimId));
  });

  it('should redirect a query notification to the messages page', async () => {
    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('QM_VIEW_MESSAGES_URL_CLICK'));

    expect(res.redirect).toHaveBeenCalledWith(QM_VIEW_QUERY_URL.replace(':id', claimId));
  });

  it('should save the claim and redirect to the hearing fee payment url', async () => {
    const claim = buildClaim();
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('PAY_HEARING_FEE_URL'));

    expect(saveDraftClaim).toHaveBeenCalledWith('redis-key', claim, true, 'user-1');
    expect(getRedirectUrl).toHaveBeenCalledWith(claimId, expect.anything(), expect.anything());
    expect(res.redirect).toHaveBeenCalledWith(paymentUrl);
  });

  it('should redirect a final order to the document named on the claim', async () => {
    const claim = buildClaim();
    claim.id = '999';
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, {
      ...redirectParams('VIEW_FINAL_ORDER'),
      documentId: '1234',
    });

    expect(res.redirect).toHaveBeenCalledWith(
      CASE_DOCUMENT_VIEW_URL.replace(':id', '999').replace(':documentId', '1234'),
    );
  });

  it('should redirect an awaiting-translation final order to the claimant dashboard', async () => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, {
      ...redirectParams('VIEW_FINAL_ORDER'),
      documentId: 'awaiting-translation',
    });

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)}?errorAwaitingTranslation`,
    );
  });

  it('should redirect a hearing notice to the English document', async () => {
    const claim = buildClaim();
    claim.caseProgressionHearing = hearingWithDocuments(englishDocumentUrl, welshDocumentUrl);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_HEARING_NOTICE'));

    expect(res.redirect).toHaveBeenCalledWith(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', '456'),
    );
  });

  it('should keep the English hearing document when Welsh is requested but the Welsh notice does not apply', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.caseProgressionHearing = hearingWithDocuments(englishDocumentUrl, welshDocumentUrl);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(false);

    const {res} = await invoke(
      DASHBOARD_NOTIFICATION_REDIRECT,
      redirectParams('VIEW_HEARING_NOTICE'),
      {lang: 'cy'},
    );

    expect(res.redirect).toHaveBeenCalledWith(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', '456'),
    );
  });

  it('should redirect a Welsh hearing notice to the Welsh document', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.caseProgressionHearing = hearingWithDocuments(englishDocumentUrl, welshDocumentUrl);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);

    const {res} = await invoke(
      DASHBOARD_NOTIFICATION_REDIRECT,
      redirectParams('VIEW_HEARING_NOTICE'),
      {lang: 'cy'},
    );

    expect(res.redirect).toHaveBeenCalledWith(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', 'ab5417ae-0004-4765-9b92-4c4680d7680e'),
    );
  });

  it('should fall back to the dashboard when hearing notice binary url is missing', async () => {
    const claim = buildClaim();
    claim.caseProgressionHearing = {
      hearingDocuments: [{value: {documentLink: {}}}],
    } as unknown as CaseProgressionHearing;
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_HEARING_NOTICE'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL)}?errorDocumentNotAvailable`,
    );
  });

  it('should fall back to the dashboard when hearing notice document id is null', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.caseProgressionHearing = hearingWithDocuments('http://dm-store:8080/documents/null/binary');
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_HEARING_NOTICE'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)}?errorDocumentNotAvailable`,
    );
  });

  it('should redirect a missing hearing notice to the defendant dashboard', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT);
    claim.caseProgressionHearing = hearingWithDocuments(undefined);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_HEARING_NOTICE'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL)}?errorDocumentNotAvailable`,
    );
  });

  it('should redirect a missing hearing notice awaiting Welsh translation to the awaiting-translation banner', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.preTranslationDocumentType = PreTranslationDocumentType.HEARING_NOTICE;
    claim.caseProgressionHearing = hearingWithDocuments(undefined);
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_HEARING_NOTICE'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)}?errorAwaitingTranslation`,
    );
  });

  it('should redirect a decision reconsideration notification to the document when available', async () => {
    const claim = buildClaim();
    claim.systemGeneratedCaseDocuments = [{
      id: '1',
      value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/decision-doc',
          document_filename: 'decision.pdf',
          document_binary_url: 'http://dm-store:8080/documents/decision-doc/binary',
        },
        documentName: 'decision.pdf',
        documentSize: 100,
        documentType: DocumentType.DECISION_MADE_ON_APPLICATIONS,
        createdDatetime: new Date('2022-06-21'),
      },
    }];
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_DECISION_RECONSIDERATION'));

    expect(res.redirect).toHaveBeenCalledWith(
      CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', 'decision-doc'),
    );
  });

  it('should fall back to the defendant dashboard when decision reconsideration document is missing', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT);
    claim.systemGeneratedCaseDocuments = [];
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_DECISION_RECONSIDERATION'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL)}?errorDocumentNotAvailable`,
    );
  });

  it('should fall back to the claimant dashboard when decision reconsideration document is missing', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.systemGeneratedCaseDocuments = [];
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);

    const {res} = await invoke(DASHBOARD_NOTIFICATION_REDIRECT, redirectParams('VIEW_DECISION_RECONSIDERATION'));

    expect(res.redirect).toHaveBeenCalledWith(
      `${constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)}?errorDocumentNotAvailable`,
    );
  });
});
