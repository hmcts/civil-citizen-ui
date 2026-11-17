import {Response} from 'express';
import claimantDashboardController from 'routes/features/dashboard/claimantDashboardController';
import {
  APPLICATION_TYPE_URL,
  BREATHING_SPACE_INFO_URL,
  DASHBOARD_CLAIMANT_URL,
  DATE_PAID_URL,
  GA_APPLICATION_SUMMARY_URL,
} from 'routes/urls';
import {getDashboardClaimById} from 'modules/utilityService';
import {
  isCarmEnabledForCase,
  isGaForLipsEnabled,
  isJudgmentBufferEnabled,
  isQueryManagementEnabled,
  isWelshEnabledForMainCase,
} from 'app/auth/launchdarkly/launchDarklyClient';
import {isCarmApplicableAndSmallClaim} from 'common/utils/carmToggleUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {updateFieldDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {
  extractOrderDocumentIdFromNotification,
  getContactCourtLink,
  getDashboardForm,
  getHelpSupportLinks,
  getHelpSupportTitle,
  getNotifications,
} from 'services/dashboard/dashboardService';
import {GaServiceClient} from 'client/gaServiceClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {CaseState} from 'form/models/claimDetails';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimantOrDefendant} from 'models/partyType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  ...jest.requireActual('modules/utilityService'),
  getDashboardClaimById: jest.fn(),
}));
jest.mock('modules/claimDetailsService', () => ({
  ...jest.requireActual('modules/claimDetailsService'),
  getTotalAmountWithInterestAndFees: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService', () => ({
  ...jest.requireActual('modules/draft-store/draftStoreService'),
  updateFieldDraftClaimFromStore: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreManagerService', () => ({
  ...jest.requireActual('modules/draft-store/draftStoreManagerService'),
  getDraftClaim: jest.fn(),
}));
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
  isGaForLipsEnabled: jest.fn(),
  isQueryManagementEnabled: jest.fn(),
  isWelshEnabledForMainCase: jest.fn(),
  isJudgmentBufferEnabled: jest.fn(),
}));
jest.mock('common/utils/carmToggleUtils', () => ({
  ...jest.requireActual('common/utils/carmToggleUtils'),
  isCarmApplicableAndSmallClaim: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
  deleteDraftGARespondentResponseFromStore: jest.fn(),
}));
jest.mock('services/features/queryManagement/viewMessagesService', () => ({
  getViewMessagesLink: jest.fn(() => ({text: 'View messages'})),
}));
jest.mock('services/dashboard/dashboardService', () => ({
  getNotifications: jest.fn(),
  getDashboardForm: jest.fn(),
  getHelpSupportTitle: jest.fn(),
  getHelpSupportLinks: jest.fn(),
  extractOrderDocumentIdFromNotification: jest.fn(),
  getContactCourtLink: jest.fn(),
}));
jest.mock('client/gaServiceClient', () => {
  const methods = {
    getApplicationsByCaseId: jest.fn(),
  };
  return {GaServiceClient: jest.fn(() => methods)};
});

const gaServiceMethods = new GaServiceClient('http://localhost') as unknown as {
  getApplicationsByCaseId: jest.Mock;
};

const viewPath = 'features/dashboard/claim-summary-redesign';
const claimId = '12345';
const uploadTaskId = '8c2712da-47ce-4050-bbee-650134a7b9e8';
const helpSupportLinks = [{text: 'Help with fees', url: '/help'}];
const mockDashboard = new Dashboard([
  new DashboardTaskList('Claim', 'Claim', []),
  new DashboardTaskList('Response', 'Response', []),
  new DashboardTaskList('Hearing', 'Hearing', [
    new DashboardTask(uploadTaskId, 'Hearings Upload hearing documents'),
  ]),
]);

type DashboardViewModel = {
  claim: Claim;
  claimId: string;
  claimIdPrettified?: string;
  claimAmountFormatted?: string;
  lang?: string;
  pageTitle: string;
  isQMFlagEnabled: boolean;
  showWelshPartyBanner: boolean;
  showErrorAwaitingTranslation: boolean;
  draftClaimDeletionDate?: string;
  dashboardNotifications?: DashboardNotificationList;
  iWantToLinks: Array<{text?: string; url?: string}>;
  helpSupportTitle: string;
  helpSupportLinks: Array<{text: string; url: string}>;
};

const buildClaim = (caseRole = CaseRole.CLAIMANT, ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.ccdState = ccdState;
  claim.totalClaimAmount = 1000;
  claim.submittedDate = new Date('2024-01-01');
  claim.applicant1 = new Party();
  return claim;
};

const invoke = async (options: {claimId?: string; query?: Record<string, string>} = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  const req = {
    params: {id: options.claimId ?? claimId},
    body: {},
    query: options.query ?? {},
    cookies: {lang: 'en'},
    session: createMockSession({user: {id: 'user-1'}}),
  };
  await getRouteHandler(claimantDashboardController, 'get', DASHBOARD_CLAIMANT_URL)(
    req as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {req, res, next};
};

const rendered = (res: ReturnType<typeof createMockResponse>): DashboardViewModel =>
  (res.render as jest.Mock).mock.calls[0][1] as DashboardViewModel;

const linkUrls = (model: DashboardViewModel): Array<string | undefined> =>
  model.iWantToLinks.map((link) => link.url);

describe('Claimant dashboard controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim());
    (getTotalAmountWithInterestAndFees as jest.Mock).mockResolvedValue(10);
    (getDraftClaim as jest.Mock).mockResolvedValue(null);
    (updateFieldDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(false);
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(false);
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(false);
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
    (isCarmApplicableAndSmallClaim as jest.Mock).mockReturnValue(false);
    (getNotifications as jest.Mock).mockResolvedValue(undefined);
    (getDashboardForm as jest.Mock).mockResolvedValue(mockDashboard);
    (extractOrderDocumentIdFromNotification as jest.Mock).mockReturnValue('doc-id');
    (getContactCourtLink as jest.Mock).mockResolvedValue({text: 'Contact the court', url: '/contact-court'});
    (getHelpSupportTitle as jest.Mock).mockReturnValue('Help and support');
    (getHelpSupportLinks as jest.Mock).mockReturnValue(helpSupportLinks);
    gaServiceMethods.getApplicationsByCaseId.mockResolvedValue([]);
  });

  it('should render a draft claim without a case number and store the hearing task id', async () => {
    const {req, res} = await invoke({claimId: 'draft', query: {lang: 'cy'}});

    const model = rendered(res);
    expect(model.pageTitle).toBe('PAGES.DASHBOARD.PAGE_TITLE');
    expect(model.claimId).toBe('draft');
    expect(model.claimIdPrettified).toBeUndefined();
    expect(model.claimAmountFormatted).toBeUndefined();
    expect(model.lang).toBe('cy');
    expect(model.helpSupportTitle).toBe('Help and support');
    expect(model.helpSupportLinks).toBe(helpSupportLinks);
    expect(req.session.dashboard?.taskIdHearingUploadDocuments).toBe(uploadTaskId);
    expect(getDashboardClaimById).not.toHaveBeenCalled();
    expect(getNotifications).toHaveBeenCalledWith('user-1', expect.any(Claim), '10', ClaimantOrDefendant.CLAIMANT, req, 'cy');
    expect(updateFieldDraftClaimFromStore).not.toHaveBeenCalled();
  });

  it('should render an issued claimant claim with awaiting-response support links', async () => {
    const claim = buildClaim();
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);

    const {req, res} = await invoke();
    const model = rendered(res);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      claimId,
      claimIdPrettified: caseNumberPrettify(claimId),
      claimAmountFormatted: currencyFormatWithNoTrailingZeros(1000),
      lang: 'en',
      showWelshPartyBanner: false,
      showErrorAwaitingTranslation: false,
    }));
    expect(model.claim.orderDocumentId).toBe('doc-id');
    expect(getDashboardForm).toHaveBeenCalledWith(
      ClaimantOrDefendant.CLAIMANT,
      claim,
      '10',
      claimId,
      req,
      false,
      false,
    );
    expect(linkUrls(model)).toEqual(expect.arrayContaining([
      '/contact-court',
      constructResponseUrlWithIdParams(claimId, DATE_PAID_URL),
      constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL),
    ]));
  });

  it('should pass the carm applicability result into the dashboard form', async () => {
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    (isCarmApplicableAndSmallClaim as jest.Mock).mockReturnValue(true);

    const {req} = await invoke();

    expect(getDashboardForm).toHaveBeenCalledWith(
      ClaimantOrDefendant.CLAIMANT,
      expect.any(Claim),
      '10',
      claimId,
      req,
      true,
      false,
    );
  });

  it('should omit debt respite for a defendant and pass the defendant role', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT);
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);

    const {req, res} = await invoke();

    expect(getDashboardForm).toHaveBeenCalledWith(
      ClaimantOrDefendant.DEFENDANT,
      claim,
      '10',
      claimId,
      req,
      false,
      false,
    );
    expect(linkUrls(rendered(res))).not.toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
    expect(linkUrls(rendered(res))).toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
  });

  it('should show awaiting-response links when judgment is requested and the buffer is enabled', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.JUDGMENT_REQUESTED));
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
  });

  it('should hide awaiting-response links when judgment is requested and the buffer is disabled', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.JUDGMENT_REQUESTED));

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).toContain('/contact-court');
    expect(urls).not.toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
    expect(urls).not.toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
  });

  it('should show settle and debt respite links during case progression', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.CASE_PROGRESSION));

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
  });

  it('should show debt respite without the settle link once all final orders are issued', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.All_FINAL_ORDERS_ISSUED));

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).not.toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
  });

  it('should hide settle and debt respite links when the claim is only issued', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.CASE_ISSUED));

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).toContain('/contact-court');
    expect(urls).not.toContain(constructResponseUrlWithIdParams(claimId, DATE_PAID_URL));
    expect(urls).not.toContain(constructResponseUrlWithIdParams(claimId, BREATHING_SPACE_INFO_URL));
  });

  it('should add the view-all-applications link when general applications exist', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.CASE_ISSUED));
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);
    (getContactCourtLink as jest.Mock).mockResolvedValue({
      text: 'Contact the court',
      url: constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL),
    });
    gaServiceMethods.getApplicationsByCaseId.mockResolvedValue([
      new ApplicationResponse('app-1', {
        applicationIsCloaked: YesNoUpperCamelCase.YES,
        applicationIsUncloakedOnce: YesNoUpperCamelCase.YES,
      } as ApplicationResponse['case_data'], ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION),
    ]);

    const {res} = await invoke();
    const urls = linkUrls(rendered(res));

    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
    expect(urls).toContain(constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUMMARY_URL));
  });

  it('should omit the view-all-applications link when there are no applications', async () => {
    (getDashboardClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, CaseState.CASE_ISSUED));
    (isGaForLipsEnabled as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke();

    expect(linkUrls(rendered(res))).not.toContain(constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUMMARY_URL));
  });

  it('should pass the query management flag through to the view', async () => {
    (isQueryManagementEnabled as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke();

    expect(rendered(res).isQMFlagEnabled).toBe(true);
  });

  it('should show the Welsh party banner and the awaiting-translation error when Welsh is enabled', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT, CaseState.CASE_ISSUED);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);
    (isWelshEnabledForMainCase as jest.Mock).mockResolvedValue(true);

    const {res} = await invoke({query: {errorAwaitingTranslation: ''}});
    const model = rendered(res);

    expect(model.showWelshPartyBanner).toBe(true);
    expect(model.showErrorAwaitingTranslation).toBe(true);
    expect(model.lang).toBe('en');
  });

  it('should hide Welsh dashboard state when the Welsh feature is disabled', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT, CaseState.CASE_ISSUED);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH;
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);

    const {res} = await invoke({query: {errorAwaitingTranslation: ''}});
    const model = rendered(res);

    expect(model.showWelshPartyBanner).toBe(false);
    expect(model.showErrorAwaitingTranslation).toBe(false);
  });

  it('should persist correspondence address fields when that address is required', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT, CaseState.CASE_ISSUED);
    claim.responseClaimTrack = 'SMALL_CLAIM';
    claim.specRespondentCorrespondenceAddressRequired = YesNoUpperCamelCase.YES;
    claim.specRespondentCorrespondenceAddressdetails = {
      PostCode: 'NN3 9SS',
      PostTown: 'NORTHAMPTON',
      AddressLine1: '29, SEATON DRIVE',
    };
    claim.respondentSolicitor1EmailAddress = 'solicitor@example.com';
    claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);

    const {req} = await invoke();

    expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(claimId, req, 'responseClaimTrack', 'SMALL_CLAIM');
    expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(
      claimId,
      req,
      'specRespondentCorrespondenceAddressdetails',
      claim.specRespondentCorrespondenceAddressdetails,
    );
    expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(claimId, req, 'respondentSolicitor1EmailAddress', 'solicitor@example.com');
    expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(claimId, req, 'specRespondent1Represented', YesNoUpperCamelCase.YES);
    expect(updateFieldDraftClaimFromStore).not.toHaveBeenCalledWith(claimId, req, 'respondentSolicitorDetails', expect.anything());
  });

  it('should persist solicitor details when no correspondence address is required', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT, CaseState.CASE_ISSUED);
    claim.respondentSolicitorDetails = {
      address: {
        PostCode: 'NN3 9SS',
        PostTown: 'NORTHAMPTON',
        AddressLine1: '29, SEATON DRIVE',
      },
    };
    claim.respondentSolicitor1EmailAddress = 'solicitor@example.com';
    claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
    (getDashboardClaimById as jest.Mock).mockResolvedValue(claim);

    const {req} = await invoke();

    expect(updateFieldDraftClaimFromStore).toHaveBeenCalledWith(
      claimId,
      req,
      'respondentSolicitorDetails',
      claim.respondentSolicitorDetails,
    );
    expect(updateFieldDraftClaimFromStore).not.toHaveBeenCalledWith(
      claimId,
      req,
      'specRespondentCorrespondenceAddressdetails',
      expect.anything(),
    );
  });

  it('should suppress the generic draft notification when a deletion date is shown', async () => {
    jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'setInterval', 'queueMicrotask']})
      .setSystemTime(new Date('2026-09-01T10:00:00.000Z'));
    (getDraftClaim as jest.Mock).mockResolvedValue({
      createdAt: '2026-08-17T08:51:21.000Z',
      expiresAt: '2026-09-16T08:51:21.000Z',
      claimResponse: {case_data: {}},
    });
    (getNotifications as jest.Mock).mockResolvedValue(new DashboardNotificationList([
      new DashboardNotification(
        'generic-draft',
        'This claim has not been submitted',
        'Nid yw\'r hawliad hwn wedi cael ei gyflwyno',
        'Your claim is saved as a draft. Continue with claim',
        'Mae eich cais wedi ei gadw fel drafft.',
        '',
        undefined,
        undefined,
        '',
        '',
      ),
      new DashboardNotification(
        'keep-this',
        'Keep this notification',
        'Cadwch yr hysbysiad hwn',
        'This notification should still be rendered',
        'Dylai\'r hysbysiad hwn gael ei ddangos o hyd',
        '',
        undefined,
        undefined,
        '',
        '',
      ),
    ]));

    try {
      const {res} = await invoke({claimId: 'draft'});
      const model = rendered(res);

      expect(model.draftClaimDeletionDate).toBe('16 September 2026');
      expect(model.dashboardNotifications?.items).toEqual([
        expect.objectContaining({titleEn: 'Keep this notification'}),
      ]);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should call next when the dashboard claim cannot be loaded', async () => {
    const error = new Error('redis failure');
    (getDashboardClaimById as jest.Mock).mockRejectedValue(error);

    const {res, next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
    expect(res.render).not.toHaveBeenCalled();
  });
});
