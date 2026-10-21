import {Response} from 'express';
import claimSummaryController from 'routes/features/dashboard/claimSummaryController';
import {DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  isCarmEnabledForCase,
  isDashboardEnabledForCase,
  isGaForLipsEnabled,
  isJudgmentBufferEnabled,
  isQueryManagementEnabled,
  isWelshEnabledForMainCase,
} from 'app/auth/launchdarkly/launchDarklyClient';
import {getCaseProgressionLatestUpdates} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';
import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {generateRedisKey, updateFieldDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {
  extractOrderDocumentIdFromNotification,
  getContactCourtLink,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from 'services/dashboard/dashboardService';
import {getClaimWithExtendedPaymentDeadline} from 'services/features/response/submitConfirmation/submitConfirmationService';
import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';
import {getViewAllApplicationLink} from 'services/features/generalApplication/generalApplicationService';
import {getViewMessagesLink} from 'services/features/queryManagement/viewMessagesService';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {ClaimantOrDefendant} from 'models/partyType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {TabId, TabLabel} from 'routes/tabs';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isDashboardEnabledForCase: jest.fn(),
  isCarmEnabledForCase: jest.fn(),
  isGaForLipsEnabled: jest.fn(),
  isQueryManagementEnabled: jest.fn(),
  isWelshEnabledForMainCase: jest.fn(),
  isJudgmentBufferEnabled: jest.fn(),
}));
jest.mock('services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService', () => ({
  getCaseProgressionLatestUpdates: jest.fn(),
}));
jest.mock('services/features/dashboard/claimSummaryService', () => ({
  getDocumentsContent: jest.fn(),
  getEvidenceUploadContent: jest.fn(),
}));
jest.mock('services/features/dashboard/claimSummary/latestUpdateService', () => ({
  getLatestUpdateContent: jest.fn(),
}));
jest.mock('services/caseDocuments/documentService', () => ({
  saveDocumentsToExistingClaim: jest.fn(),
}));
jest.mock('services/features/caseProgression/bundles/bundlesService', () => ({
  getBundlesContent: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  updateFieldDraftClaimFromStore: jest.fn(),
}));
jest.mock('services/dashboard/dashboardService', () => ({
  extractOrderDocumentIdFromNotification: jest.fn(),
  getContactCourtLink: jest.fn(),
  getDashboardForm: jest.fn(),
  getHelpSupportLinks: jest.fn(),
  getHelpSupportTitle: jest.fn(),
  getNotifications: jest.fn(),
}));
jest.mock('services/features/response/submitConfirmation/submitConfirmationService', () => ({
  getClaimWithExtendedPaymentDeadline: jest.fn(),
}));
jest.mock('common/utils/carmToggleUtils', () => ({
  isCarmApplicableAndSmallClaim: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getViewAllApplicationLink: jest.fn(),
}));
jest.mock('services/features/queryManagement/viewMessagesService', () => ({
  getViewMessagesLink: jest.fn(),
}));
jest.mock('modules/claimDetailsService', () => ({
  getTotalAmountWithInterestAndFees: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const claimId = '12345678';
const legacyView = 'features/dashboard/claim-summary';
const redesignView = 'features/dashboard/claim-summary-redesign';
const paymentDeadline = new Date('2024-06-01');
const latestUpdatePanels = [{contentSections: [{data: {text: 'latest'}}]}];
const documentPanels = [{contentSections: [{data: {text: 'documents'}}]}];
const evidencePanels = [{contentSections: [{data: {text: 'evidence'}}]}];
const progressionPanels = [{contentSections: [{data: {text: 'progression'}}]}];
const bundlePanels = [{contentSections: [{data: {text: 'bundles'}}]}];
const contactLink = {text: 'Contact the court', url: '/contact'};
const notifications: unknown[] = [];

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.caseRole = CaseRole.DEFENDANT;
  claim.totalClaimAmount = 1000;
  claim.submittedDate = new Date('2024-01-01');
  claim.responseClaimTrack = 'SMALL_CLAIM';
  return claim;
};

const invoke = async (overrides: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  const session = createMockSession(
    (overrides.session as Record<string, unknown> | undefined) ?? {user: {id: 'user-1'}},
  );
  await getRouteHandler(claimSummaryController, 'get', DEFENDANT_SUMMARY_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {lang: 'en'},
      cookies: {},
      ...overrides,
      session,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next, session};
};

const tabContent = (res: {render: jest.Mock}): Array<{id: string; label: string; panels: unknown}> =>
  (res.render.mock.calls[0][1] as {tabContent: Array<{id: string; label: string; panels: unknown}>}).tabContent;

describe('Claim Summary Controller Defendant', () => {
  let claim: Claim;

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(claim);
    (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    (isCarmApplicableAndSmallClaim as jest.Mock).mockReturnValue(true);
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(false);
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
    (getLatestUpdateContent as jest.Mock).mockReturnValue(latestUpdatePanels);
    (getDocumentsContent as jest.Mock).mockResolvedValue(documentPanels);
    (getEvidenceUploadContent as jest.Mock).mockReturnValue(evidencePanels);
    (getCaseProgressionLatestUpdates as jest.Mock).mockReturnValue(progressionPanels);
    (getBundlesContent as jest.Mock).mockReturnValue(bundlePanels);
    (saveDocumentsToExistingClaim as jest.Mock).mockResolvedValue(undefined);
    (generateRedisKey as jest.Mock).mockReturnValue('redis-key');
    (getClaimWithExtendedPaymentDeadline as jest.Mock).mockResolvedValue(paymentDeadline);
    (updateFieldDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    (getTotalAmountWithInterestAndFees as jest.Mock).mockResolvedValue(1000);
    (getNotifications as jest.Mock).mockResolvedValue(notifications);
    (getDashboardForm as jest.Mock).mockResolvedValue({items: []});
    (extractOrderDocumentIdFromNotification as jest.Mock).mockReturnValue('order-1');
    (getContactCourtLink as jest.Mock).mockResolvedValue(contactLink);
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue([] as unknown[]);
    (getViewAllApplicationLink as jest.Mock).mockResolvedValue(undefined);
    (getViewMessagesLink as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders latest update and documents tabs when there is no SDO', async () => {
      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(legacyView, expect.objectContaining({
        claim,
        claimId,
        responseDetailsUrl: undefined,
      }));
      expect(tabContent(res).map((tab) => tab.id)).toEqual([TabId.LATEST_UPDATE, TabId.DOCUMENTS]);
      expect(tabContent(res)[0].label).toBe(TabLabel.LATEST_UPDATE);
      expect(tabContent(res)[0].panels).toBe(latestUpdatePanels);
      expect(tabContent(res)[1].panels).toBe(documentPanels);
      expect(getLatestUpdateContent).toHaveBeenCalledWith(claimId, claim, 'en', paymentDeadline, false);
      expect(saveDocumentsToExistingClaim).toHaveBeenCalledWith('redis-key', claim);
      expect(getCaseProgressionLatestUpdates).not.toHaveBeenCalled();
      expect(getEvidenceUploadContent).not.toHaveBeenCalled();
      expect(getBundlesContent).not.toHaveBeenCalled();
    });

    it('renders updates, notices and evidence tabs when an SDO exists', async () => {
      claim.sdoOrderDocument = {id: 'sdo'} as unknown as Claim['sdoOrderDocument'];

      const {res} = await invoke();
      const tabs = tabContent(res);

      expect(res.render).toHaveBeenCalledWith(legacyView, expect.objectContaining({claimId}));
      expect(tabs.map((tab) => tab.id)).toEqual([TabId.UPDATES, TabId.NOTICES, TabId.DOCUMENTS]);
      expect(tabs.map((tab) => tab.label)).toEqual([TabLabel.UPDATES, TabLabel.NOTICES, TabLabel.DOCUMENTS]);
      expect(tabs[0].panels).toBe(progressionPanels);
      expect(tabs[2].panels).toBe(evidencePanels);
      expect(getCaseProgressionLatestUpdates).toHaveBeenCalledWith(claim, 'en');
      expect(getEvidenceUploadContent).toHaveBeenCalledWith(claim, 'en');
    });

    it('adds a bundles tab when the bundle is stitched', async () => {
      claim.sdoOrderDocument = {id: 'sdo'} as unknown as Claim['sdoOrderDocument'];
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.caseBundles = [{stitchedDocument: {document_url: 'url'}}] as unknown as CaseProgression['caseBundles'];

      const {res} = await invoke();
      const tabs = tabContent(res);

      expect(tabs.map((tab) => tab.id)).toEqual([TabId.UPDATES, TabId.NOTICES, TabId.DOCUMENTS, TabId.BUNDLES]);
      expect(tabs[3].label).toBe(TabLabel.BUNDLES);
      expect(tabs[3].panels).toBe(bundlePanels);
      expect(getBundlesContent).toHaveBeenCalledWith(claimId, claim, 'en');
    });

    it('does not render when the legacy claim is empty', async () => {
      civilServiceMethods.retrieveClaimDetails.mockResolvedValue(new Claim());

      const {res, next} = await invoke();

      expect(res.render).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('renders the redesign dashboard and passes carm and the response track', async () => {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.objectContaining({
        claim,
        claimId,
        dashboardNotifications: notifications,
        helpSupportTitle: 'Help and support',
        helpSupportLinks: [],
        isQMFlagEnabled: false,
        showWelshPartyBanner: false,
        showErrorAwaitingTranslation: false,
        lang: 'en',
        iWantToLinks: [contactLink],
      }));
      expect(claim.orderDocumentId).toBe('order-1');
      expect(getNotifications).toHaveBeenCalledWith(
        claimId,
        claim,
        '1000',
        ClaimantOrDefendant.DEFENDANT,
        expect.anything(),
        'en',
      );
      expect(getDashboardForm).toHaveBeenCalledWith(
        ClaimantOrDefendant.DEFENDANT,
        claim,
        '1000',
        claimId,
        expect.anything(),
        true,
        false,
      );
      expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(claimId, expect.anything(), 'responseClaimTrack', 'SMALL_CLAIM');
      expect(getContactCourtLink).toHaveBeenCalledWith(claimId, claim, false, 'en');
      expect(res.render).not.toHaveBeenCalledWith(legacyView, expect.anything());
    });

    it('stores the hearing document upload task id', async () => {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (getDashboardForm as jest.Mock).mockResolvedValue({
        items: [
          {tasks: []},
          {tasks: []},
          {tasks: [
            {id: 'other', taskNameEn: 'Prepare'},
            {id: 'upload-1', taskNameEn: 'Hearings Upload hearing documents'},
          ]},
        ],
      });

      const {res, session} = await invoke();

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.anything());
      expect(session.dashboard.taskIdHearingUploadDocuments).toBe('upload-1');
    });

    it('includes application and message links when those services return them', async () => {
      const applicationLink = {text: 'View applications', url: '/applications'};
      const messageLink = {text: 'View messages', url: '/messages'};
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
      (getViewAllApplicationLink as jest.Mock).mockResolvedValue(applicationLink);
      (getViewMessagesLink as jest.Mock).mockResolvedValue(messageLink);

      const {res} = await invoke();
      const view = res.render.mock.calls[0][1] as {iWantToLinks: Array<{text: string; url: string}>};

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.anything());
      expect(view.iWantToLinks).toEqual([contactLink, applicationLink, messageLink]);
      expect(getViewAllApplicationLink).toHaveBeenCalledWith(expect.anything(), claim, true, 'en');
    });

    it('passes the query management flag into the redesign view', async () => {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.objectContaining({
        isQMFlagEnabled: true,
      }));
    });

    it('shows the welsh party banner when welsh is enabled and a party is bilingual', async () => {
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.objectContaining({
        showWelshPartyBanner: true,
        showErrorAwaitingTranslation: false,
      }));
    });

    it('hides the welsh party banner when welsh is disabled', async () => {
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);

      const {res} = await invoke();

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.objectContaining({
        showWelshPartyBanner: false,
      }));
    });

    it('flags a translation error when welsh is enabled and the query is present', async () => {
      (isDashboardEnabledForCase as jest.Mock).mockResolvedValue(true);
      (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(true);

      const {res} = await invoke({query: {lang: 'en', errorAwaitingTranslation: '1'}});

      expect(res.render).toHaveBeenCalledWith(redesignView, expect.objectContaining({
        showErrorAwaitingTranslation: true,
      }));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('ccd failure');
      civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });
});
