import express, {Router} from 'express';
import request from 'supertest';
process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

import {ApplicationTypeOption} from '../../../main/common/models/generalApplication/applicationType';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {YesNo} from '../../../main/common/form/models/yesNo';
import {Claim} from '../../../main/common/models/claim';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  ORDER_JUDGE_URL,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
  PAYING_FOR_APPLICATION_URL,
  GA_RESPONSE_CONFIRMATION_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_RESPONSE_CHECK_ANSWERS_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
  GA_COSC_CONFIRM_URL,
} from '../../../main/routes/urls';
import applicationTypeController from '../../../main/routes/features/generalApplication/applicationTypeController';
import payingForApplicationController from '../../../main/routes/features/generalApplication/payingForApplicationController';
import gaCheckAnswersResponseController
  from '../../../main/routes/features/generalApplication/response/checkAnswersResponseController';
import applicationResponseConfirmationController
  from '../../../main/routes/features/generalApplication/response/applicationResponseConfirmationController';
import submitConfirmationController from '../../../main/routes/features/generalApplication/submitGeneralApplicationConfirmationController';
import coscConfirmationController from '../../../main/routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController';
jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(() => 'redis-claim'),
  generateRedisKeyForGA: jest.fn(() => 'redis-ga'),
  getCaseDataFromStore: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  ...jest.requireActual('modules/utilityService'),
  getClaimById: jest.fn(),
}));
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn().mockResolvedValue({applyHelpWithFees: {option: undefined}}),
  saveDraftGAHWFDetails: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  deleteGAFromClaimsByUserId: jest.fn().mockResolvedValue(undefined),
  getByIndex: jest.fn(),
  getCancelUrl: jest.fn().mockResolvedValue('/dashboard'),
  getDashboardUrlForParty: jest.requireActual('services/features/generalApplication/generalApplicationService').getDashboardUrlForParty,
  isConfirmYouPaidCCJAppType: jest.requireActual('services/features/generalApplication/generalApplicationService').isConfirmYouPaidCCJAppType,
  resolveApplicationTypeIndexForGet: jest.fn((_req, claim) =>
    claim.generalApplication?.applicationTypes?.length === 1 ? 0 : undefined,
  ),
  resolveApplicationTypeIndexForPost: jest.fn((req, claim) =>
    req.query.index !== undefined
      ? Number(req.query.index)
      : claim.generalApplication?.applicationTypes?.length === 1 ? 0 : undefined,
  ),
  saveApplicationType: jest.fn().mockResolvedValue(undefined),
  isChangeScreenFromCya: jest.fn((req) => req.query.changeScreen === 'true'),
  startApplicationTypeChangeFromCya: jest.fn().mockResolvedValue(undefined),
  validateAdditionalApplicationType: jest.fn(),
  validateAdditionalApplicationtType: jest.fn(),
  addChangeScreenToUrlIfPresent: jest.fn((url: string) => url),
  getDynamicHeaderForMultipleApplications: jest.fn(() => 'Application 1'),
  saveRespondentAgreement: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('services/features/generalApplication/feeDetailsService', () => ({
  gaApplicationFeeDetails: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseService', () => {
  const actual = jest.requireActual('services/features/generalApplication/response/generalApplicationResponseService');
  return {
    ...actual,
    getRespondToApplicationCaption: jest.fn(() => 'Respond to this application'),
    saveRespondentStatementOfTruth: jest.fn().mockResolvedValue(undefined),
  };
});
jest.mock('services/features/generalApplication/response/checkAnswersResponseService', () => ({
  getSummarySections: jest.fn((): unknown[] => []),
}));
jest.mock('services/features/generalApplication/response/submitApplicationResponse', () => ({
  submitApplicationResponse: jest.fn().mockResolvedValue(undefined),
}));
import {gaApplicationFeeDetails} from 'services/features/generalApplication/feeDetailsService';
import {getDraftGARespondentResponse} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import {gaServiceClientMock} from '../../setup/sharedMocks';
import {getClaimById} from 'modules/utilityService';

const CLAIM_ID = '1640995200000000';
const APP_ID = 'GA-1001';

const withId = (url: string) => url.replace(':id', CLAIM_ID);
const withIdAndAppId = (url: string) => url.replace(':id', CLAIM_ID).replace(':appId', APP_ID);

const createControllerApp = (controller: Router) => {
  const app = express();
  app.use(express.urlencoded({extended: true}));
  app.use(express.json());
  app.use((req, _res, next) => {
    req.cookies = {};
    (req as unknown as {session: {user: {id: string}}}).session = {user: {id: 'u1'}};
    next();
  });
  app.use((req, res, next) => {
    (res as unknown as {render: (view: string, data: unknown) => void}).render =
      (view: string, data: unknown) => { res.status(200).json({view, data}); };
    next();
  });
  app.use(controller);
  app.use((err: Error, _req: express.Request, res: express.Response) => {
    res.status(500).json({error: err.message});
  });
  return app;
};

const buildClaim = (caseRole: CaseRole, appType: ApplicationTypeOption): Claim => {
  const claim = new Claim();
  claim.id = CLAIM_ID;
  claim.legacyCaseReference = CLAIM_ID;
  claim.caseRole = caseRole;
  claim.generalApplication = {
    applicationTypes: [{option: appType}],
    informOtherParties: {option: YesNo.NO},
    agreementFromOtherParty: YesNo.NO,
  } as unknown as Claim['generalApplication'];
  return claim;
};

describe('Integration: general application route migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (gaServiceClientMock as unknown as {getApplicationsByCaseId: jest.Mock}).getApplicationsByCaseId = jest.fn();
  });

  describe.each([
    {name: 'standard', controller: submitConfirmationController, url: GENERAL_APPLICATION_CONFIRM_URL},
    {name: 'COSC', controller: coscConfirmationController, url: GA_COSC_CONFIRM_URL},
  ])('$name confirmation recovery', ({controller, url}) => {
    it.each([CaseRole.CLAIMANT, CaseRole.DEFENDANT])('uses a non-destructive dashboard redirect for missing or repeated query parameters (%s)', async role => {
      const claim = buildClaim(role, ApplicationTypeOption.EXTEND_TIME);
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      const app = createControllerApp(controller);
      const dashboard = withId(role === CaseRole.CLAIMANT ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL);
      await request(app).get(withId(url)).expect(302).expect('Location', dashboard);
      await request(app).get(`${withId(url)}?id=first&id=second&appFee=108`).expect(302).expect('Location', dashboard);
      await request(app).get(`${withId(url)}?id=selected-entry&appFee=108&appFee=0`).expect(302).expect('Location', dashboard);
    });

    it('retains an explicit zero fee and collection-item identity through HTTP parsing', async () => {
      const claim = buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME);
      claim.generalApplications = [
        {id: 'other-entry', value: {caseLink: {CaseReference: '9990000000000001'}}},
        {id: 'selected-entry', value: {caseLink: {CaseReference: '9990000000000002'}}},
      ] as Claim['generalApplications'];
      claim.generalApplication.applicationFee = {calculatedAmountInPence: 99900} as Claim['generalApplication']['applicationFee'];
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      const response = await request(createControllerApp(controller))
        .get(`${withId(url)}?id=selected-entry&appFee=0`).expect(200);
      const content = response.body.data.confirmationContent;
      const button = content.find((section: {data: {href?: string}}) => section.data.href?.includes('apply-help-fee-selection'));
      expect(button.data.href).toBe(`/case/${CLAIM_ID}/general-application/apply-help-fee-selection?id=selected-entry&appFee=0`);
    });
  });

  it('application type: single selected type routes to agreement-from-other-party', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME));
    const app = createControllerApp(applicationTypeController);

    const res = await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .send({option: ApplicationTypeOption.EXTEND_TIME})
      .expect(302);

    expect(res.header.location).toContain(withId(GA_AGREEMENT_FROM_OTHER_PARTY_URL));
  });

  it('application type: multiple types route to order-judge', async () => {
    const claim = buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME);
    claim.generalApplication.applicationTypes.push({option: ApplicationTypeOption.ADJOURN_HEARING} as unknown as never);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    const app = createControllerApp(applicationTypeController);

    const res = await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .query({index: 1})
      .send({option: ApplicationTypeOption.SUMMARY_JUDGEMENT})
      .expect(302);

    expect(res.header.location).toContain(withId(ORDER_JUDGE_URL));
  });

  it('application type: defendant CCJ paid branch routes to debt-payment guidance', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT, ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
    claim.joIsLiveJudgmentExists = {option: YesNo.YES} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    const app = createControllerApp(applicationTypeController);

    const res = await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .send({option: ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID})
      .expect(302);

    expect(res.header.location).toContain(withId(GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL));
  });

  it('application type: OTHER_OPTION is normalised before save', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.OTHER));
    const saveApplicationTypeMock = saveApplicationType as jest.Mock;
    const app = createControllerApp(applicationTypeController);

    await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .send({option: ApplicationTypeOption.OTHER_OPTION, optionOther: ApplicationTypeOption.OTHER})
      .expect(302);

    expect(saveApplicationTypeMock).toHaveBeenCalled();
    expect(saveApplicationTypeMock.mock.calls[0][2].option).toBe(ApplicationTypeOption.OTHER);
  });

  it('application type: display labels are rejected before save', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME));
    const saveApplicationTypeMock = saveApplicationType as jest.Mock;
    const app = createControllerApp(applicationTypeController);

    const res = await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .send({option: 'Summary judgment'})
      .expect(200);

    expect(res.body.data.form.errors[0].constraints).toEqual(expect.objectContaining({
      isIn: 'ERRORS.APPLICATION_TYPE_REQUIRED',
    }));
    expect(saveApplicationTypeMock).not.toHaveBeenCalled();
  });

  it('application type: top-level-only values are rejected in the Other branch before save', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME));
    const saveApplicationTypeMock = saveApplicationType as jest.Mock;
    const app = createControllerApp(applicationTypeController);

    const res = await request(app)
      .post(withId(APPLICATION_TYPE_URL))
      .send({option: ApplicationTypeOption.OTHER_OPTION, optionOther: ApplicationTypeOption.SET_ASIDE_JUDGEMENT})
      .expect(200);

    expect(res.body.data.form.errors[0].constraints).toEqual(expect.objectContaining({
      applicationTypeInvalid: 'ERRORS.APPLICATION_TYPE_REQUIRED',
    }));
    expect(saveApplicationTypeMock).not.toHaveBeenCalled();
  });

  it('paying-for-application renders calculated fee amount', async () => {
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME));
    (gaApplicationFeeDetails as jest.Mock).mockResolvedValue({calculatedAmountInPence: '27500'});
    const app = createControllerApp(payingForApplicationController);

    const res = await request(app).get(withId(PAYING_FOR_APPLICATION_URL)).expect(200);

    expect(res.body.data.applicationFee).toBe(275);
  });

  it('respondent check-and-send route covers success redirect branch', async () => {
    const claim = buildClaim(CaseRole.DEFENDANT, ApplicationTypeOption.EXTEND_TIME);
    claim.respondent1 = {partyDetails: {companyName: 'Defendant Ltd'}} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getDraftGARespondentResponse as jest.Mock).mockResolvedValue({generalApplicationType: [ApplicationTypeOption.EXTEND_TIME]});
    const app = createControllerApp(gaCheckAnswersResponseController);

    const res = await request(app)
      .post(withIdAndAppId(GA_RESPONSE_CHECK_ANSWERS_URL))
      .send({signed: 'yes', name: 'John Doe', title: 'Director'})
      .expect(302);

    expect(res.header.location).toEqual(withIdAndAppId(GA_RESPONSE_CONFIRMATION_URL));
  });

  it('response confirmation covers claimant and defendant dashboard routing', async () => {
    const app = createControllerApp(applicationResponseConfirmationController);

    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.EXTEND_TIME));
    const claimantRes = await request(app).get(withIdAndAppId(GA_RESPONSE_CONFIRMATION_URL)).expect(200);
    expect(claimantRes.body.data.dashboardUrl).toEqual(withId(DASHBOARD_CLAIMANT_URL));

    (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.DEFENDANT, ApplicationTypeOption.EXTEND_TIME));
    const defendantRes = await request(app).get(withIdAndAppId(GA_RESPONSE_CONFIRMATION_URL)).expect(200);
    expect(defendantRes.body.data.dashboardUrl).toEqual(withId(DEFENDANT_SUMMARY_URL));
  });

  it('with-notice and without-notice fee-body branching is represented through fee-details call inputs', async () => {
    const withNoticeClaim = buildClaim(CaseRole.CLAIMANT, ApplicationTypeOption.ADJOURN_HEARING);
    withNoticeClaim.generalApplication.informOtherParties = {option: YesNo.YES} as unknown as never;
    (getClaimById as jest.Mock).mockResolvedValue(withNoticeClaim);
    (gaApplicationFeeDetails as jest.Mock).mockResolvedValue({calculatedAmountInPence: '11900'});
    const app = createControllerApp(payingForApplicationController);

    await request(app).get(withId(PAYING_FOR_APPLICATION_URL)).expect(200);
    expect(gaApplicationFeeDetails).toHaveBeenCalled();
  });

  it('application type accepts all main GA type options used in migration scope', async () => {
    const app = createControllerApp(applicationTypeController);
    const mainTypes = [
      ApplicationTypeOption.EXTEND_TIME,
      ApplicationTypeOption.ADJOURN_HEARING,
      ApplicationTypeOption.SUMMARY_JUDGEMENT,
      ApplicationTypeOption.STRIKE_OUT,
      ApplicationTypeOption.VARY_ORDER,
      ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT,
      ApplicationTypeOption.RELIEF_FROM_SANCTIONS,
      ApplicationTypeOption.OTHER,
    ];

    for (const option of mainTypes) {
      (getClaimById as jest.Mock).mockResolvedValue(buildClaim(CaseRole.CLAIMANT, option));
      const res = await request(app).post(withId(APPLICATION_TYPE_URL)).send({option}).expect(302);
      expect(res.header.location).toContain(withId(GA_AGREEMENT_FROM_OTHER_PARTY_URL));
    }
  });

});
